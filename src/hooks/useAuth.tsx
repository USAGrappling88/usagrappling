import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
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
  const previousUserIdRef = useRef<string | null>(null);
  const checkedAdminUserIdRef = useRef<string | null>(null);

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
      const nextUserId = currentSession?.user?.id ?? null;
      const userChanged = previousUserIdRef.current !== nextUserId;

      if (userChanged) {
        setIsLoading(true);
        checkedAdminUserIdRef.current = null;
      }

      previousUserIdRef.current = nextUserId;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (!currentSession?.user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      if (checkedAdminUserIdRef.current === nextUserId) {
        setIsLoading(false);
        return;
      }

      const roles = await checkAdminRole(currentSession.user.id);
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out globally, clearing local session instead:', error);
      await supabase.auth.signOut({ scope: 'local' });
    }

    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    checkedAdminUserIdRef.current = null;
    previousUserIdRef.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isSuperAdmin, isLoading, signIn, signUp, signOut }}>
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
