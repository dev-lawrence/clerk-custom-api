'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { OAuthStrategy } from '@clerk/types';
import { toast } from 'sonner';
import { SignInWithPasskeyButton } from '@/components/SignInWithPasskeyButton';

export default function Page() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({
    email: '',
    password: '',
    general: '',
  });
  const router = useRouter();

  if (!signIn) return null;

  // Handle submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    setErrors({});

    setIsLoading(true);

    // Start the sign-up process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        toast.success('Login successful!');
        router.push('/');
      } else {
        // Handle other statuses like 'needs-second-factor', etc.
        toast.warning('Additional verification required');
        console.log('Sign-in status:', signInAttempt.status);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.errors && err.errors.length > 0) {
        const clerkErrors = err.errors;

        clerkErrors.forEach((error: any) => {
          switch (error.code) {
            case 'strategy_for_user_invalid':
              setErrors((prev) => ({
                ...prev,
                general:
                  'This account only supports Google Sign In. Please use the "Continue with Google" button.',
              }));
              break;
            case 'form_password_length_too_short':
              setErrors((prev) => ({
                ...prev,
                password: 'Passwords must be 8 characters or more.',
              }));
              break;
            case 'form_password_pwned':
              setErrors((prev) => ({
                ...prev,
                password: 'Password is too weak.',
              }));
              break;
            case 'form_identifier_exists':
              setErrors((prev) => ({
                ...prev,
                email: 'Email address is taken. Please try another.',
              }));
              break;
            default:
              setErrors((prev) => ({
                ...prev,
                general: error.message || 'Authentication failed',
              }));
          }
        });
      } else {
        setErrors({ general: 'An unexpected error occurred' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWith = async (strategy: OAuthStrategy) => {
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: '/',
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err: any) => {
        // See https://clerk.com/docs/guides/development/custom-flows/error-handling
        // for more info on error handling
        console.log(err.errors);
        console.error(err, null, 2);
      });
  };

  return (
    <>
      <Card className="max-w-lg mx-auto mt-20">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2 mb-5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
                {errors.email && (
                  <div className="text-sm text-red-600">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="grid gap-2 mb-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <div className="text-sm text-red-600">{errors.password}</div>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Loading...' : 'Login'}
            </Button>

            {errors.general && (
              <div className="mt-2 text-sm text-red-600 text-center">
                {errors.general}
              </div>
            )}
          </form>

          <div className="flex mt-3 items-center justify-center gap-4">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => signInWith('oauth_google')}
            >
              Continue with Google
            </Button>

            <SignInWithPasskeyButton />
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="sign-up" className="underline underline-offset-4">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
