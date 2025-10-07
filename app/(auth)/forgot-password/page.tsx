'use client';

import { useEffect, useState } from 'react';
import { useAuth, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true);
        setError('');
        toast.success('Reset code sent to your email!');
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      })
      .finally(() => setIsLoading(false));
  }

  // Reset the user's password.
  // Upon successful reset, the user will be
  // signed in and redirected to the home page
  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        // Check if 2FA is required
        if (result.status === 'needs_second_factor') {
          setSecondFactor(true);
          setError('');
        } else if (result.status === 'complete') {
          // Set the active session to
          setActive({ session: result.createdSessionId });
          setError('');
          toast.success('Password reset successfully!');
          router.push('/');
        } else {
          console.log(result);
        }
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <>
      <Card className="max-w-lg mx-auto mt-20">
        <CardHeader>
          <CardTitle>Forgot Password?</CardTitle>
          <CardDescription>
            {successfulCreation
              ? 'Enter your new password and the reset code'
              : 'Enter your email to receive a password reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={!successfulCreation ? create : reset}>
            <div className="flex flex-col gap-4">
              {!successfulCreation ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g john@doe.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="code">Reset Code</Label>
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Check your email"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {secondFactor && (
                <div className="rounded-md bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-700">
                    Two-factor authentication required. Please complete the
                    second factor.
                  </p>
                </div>
              )}

              <div className="mt-4 text-center text-sm">
                Remember your password?{' '}
                <a
                  href="/sign-in"
                  className="hover:text-primary underline underline-offset-4"
                >
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
