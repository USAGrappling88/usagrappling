import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { opsSupabase } from '@/lib/opsSupabase';
import { toast } from 'sonner';
import { Loader2, Lock, KeyRound, CheckCircle2, ArrowRight, Mail } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isOps, setIsOps] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const establishRecoverySession = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const code = queryParams.get('code');
        const type = queryParams.get('type') ?? hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const opsFlag = queryParams.get('ops') === '1' || hashParams.get('ops') === '1';
        setIsOps(opsFlag);
        const client = opsFlag ? opsSupabase : supabase;

        if (code) {
          const { data, error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setIsValidSession(!!data.session);
        } else if (type === 'recovery' && accessToken && refreshToken) {
          const { data, error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          setIsValidSession(!!data.session);
        } else {
          const { data, error } = await client.auth.getSession();
          if (error) throw error;
          setIsValidSession(!!data.session);
        }

        if (window.location.hash || window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('Error validating reset password session:', error);
        setIsValidSession(false);
      } finally {
        setIsChecking(false);
      }
    };

    void establishRecoverySession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const client = isOps ? opsSupabase : supabase;
    const { error } = await client.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (isOps) {
      toast.success('Ops password updated. Reconnecting…');
      setIsSuccess(true);
      return;
    }

    await supabase.auth.signOut({ scope: 'local' });
    toast.success('Password updated successfully. Please sign in with your new password.');
    navigate('/auth?redirect=/admin');
  };

  if (isChecking) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isValidSession) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Invalid or Expired Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')}>Back to Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const onboardingSteps = [
    'Go to usa-grappling.com/admin and choose Sign In (not Sign Up)',
    'Use this email and your new password',
    "You'll see the events you're assigned to, with your team's tasks and deadlines — check tasks off as you complete them",
    "You'll get automatic email/text reminders for anything due within 3 days or overdue",
  ];

  const GuidanceBox = () => (
    <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm">
      <h3 className="mb-3 font-semibold text-foreground">What happens next</h3>
      <ol className="ml-4 list-decimal space-y-2 text-muted-foreground">
        {onboardingSteps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );

  const SignInButton = () => (
    <Button
      className="mt-4 w-full"
      onClick={() => {
        window.location.href = '/auth?redirect=/admin';
      }}
    >
      Go to Sign In
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to the USA Grappling Production Team</CardTitle>
            <CardDescription>
              Set your password below. You'll use it together with your email address to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-3 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold">Password set</h2>
                  <p className="text-sm text-muted-foreground">Your password has been updated successfully.</p>
                </div>
                <GuidanceBox />
                <SignInButton />
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  Questions? Contact <a href="mailto:blair@usagrappling.com" className="underline hover:text-foreground">blair@usagrappling.com</a>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </form>
                <GuidanceBox />
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  Questions? Contact <a href="mailto:blair@usagrappling.com" className="underline hover:text-foreground">blair@usagrappling.com</a>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;
