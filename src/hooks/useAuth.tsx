import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { opsSupabase } from '@/lib/opsSupabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  opsConnected: boolean;
  opsError: string | null;
  reconnectOps: (password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [opsConnected, setOpsConnected] = useState(false);
  const [opsError, setOpsError] = useState<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);
  const checkedAdminUserIdRef = useRef<string | null>(null);
  const authSyncIdRef = useRef(0);

  const attemptOpsSignIn = async (email: string, password: string) => {
    try {
      const opsResult = await opsSupabase.auth.signInWithPassword({ email, password });
      if (opsResult.error) {
        console.error('Ops sign-in failed:', opsResult.error.message);
        setOpsConnected(false);
        setOpsError(opsResult.error.message);
        return { error: opsResult.error as Error };
      }
      setOpsConnected(true);
      setOpsError(null);
      return { error: null };
    } catch (e: any) {
      console.error('Ops sign-in threw:', e);
      setOpsConnected(false);
      setOpsError(e?.message ?? 'Unknown ops sign-in error');
      return { error: e as Error };
    }
  };

  const reconnectOps = async (password: string) => {
    const email = user?.email;
    if (!email) return { error: new Error('Not signed in') };
    return attemptOpsSignIn(email, password);
  };

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error checking admin role:', error);
      return { isAdmin: false, isSuperAdmin: false };
    }
    const roles = data?.map(r => r.role) || [];
    return {
      isAdmin: roles.includes('admin') || roles.includes('super_admin'),
      isSuperAdmin: roles.includes('super_admin'),
    };
  };

  useEffect(() => {
    const syncAuthState = async (currentSession: Session | null) => {
      const syncId = ++authSyncIdRef.current;
      const nextUserId = currentSession?.user?.id ?? null;
      const userChanged = previousUserIdRef.current !== nextUserId;

      if (userChanged) {
        if (authSyncIdRef.current !== syncId) return;
        setIsLoading(true);
        checkedAdminUserIdRef.current = null;
      }

      if (authSyncIdRef.current !== syncId) return;
      previousUserIdRef.current = nextUserId;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (!currentSession?.user) {
        if (authSyncIdRef.current !== syncId) return;
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      if (checkedAdminUserIdRef.current === nextUserId) {
        if (authSyncIdRef.current !== syncId) return;
        setIsLoading(false);
        return;
      }

      const roles = await checkAdminRole(currentSession.user.id);
      if (authSyncIdRef.current !== syncId) return;
      setIsAdmin(roles.isAdmin);
      setIsSuperAdmin(roles.isSuperAdmin);
      checkedAdminUserIdRef.current = nextUserId;
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        void syncAuthState(currentSession);
      }
    );

    void supabase.auth.getSession().then(async ({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('Error restoring session:', error);
        await supabase.auth.signOut({ scope: 'local' });
        await syncAuthState(null);
        return;
      }

      await syncAuthState(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      return { error: error as Error | null };
    }

    // Mirror auth into the ops Supabase project so ops RLS queries run as this user.
    await attemptOpsSignIn(email, password);

    const nextSession = data.session ?? null;
    const nextUser = data.user ?? nextSession?.user ?? null;

    if (nextUser) {
      previousUserIdRef.current = nextUser.id;
      setSession(nextSession);
      setUser(nextUser);

      const roles = await checkAdminRole(nextUser.id);
      setIsAdmin(roles.isAdmin);
      setIsSuperAdmin(roles.isSuperAdmin);
      checkedAdminUserIdRef.current = nextUser.id;
    }

    setIsLoading(false);
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error) {
      // Notify super admins about the new signup
      supabase.functions.invoke('notify-admin-signup', {
        body: { email },
      }).catch(console.error);
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    authSyncIdRef.current += 1;
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out globally, clearing local session instead:', error);
      await supabase.auth.signOut({ scope: 'local' });
    }

    try {
      await opsSupabase.auth.signOut();
    } catch (e) {
      console.warn('Ops sign-out failed:', e);
    }

    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setOpsConnected(false);
    setOpsError(null);
    checkedAdminUserIdRef.current = null;
    previousUserIdRef.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isSuperAdmin, isLoading, opsConnected, opsError, reconnectOps, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
