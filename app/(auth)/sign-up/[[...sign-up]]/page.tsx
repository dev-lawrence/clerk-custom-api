'use client';

import { useSignUp } from '@clerk/nextjs';
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

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

  if (!signUp) return null;

  const validateForm = (values: { email: string; password: string }) => {
    const newErrors: typeof errors = {};

    if (!values.email.trim()) {
      newErrors.email = 'Email is required.';
    }

    if (!values.password) {
      newErrors.password = 'Password is required.';
    } else if (values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm({
      email: emailAddress,
      password: password,
    });

    if (!isValid) {
      return;
    }

    if (!isLoaded) return;
    setIsLoading(true);

    // Start the sign-up process using the email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.errors && err.errors.length > 0) {
        const clerkErrors = err.errors;

        clerkErrors.forEach((error: any) => {
          switch (error.code) {
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

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    setIsVerifying(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
              console.log(session?.currentTask);
              return;
            }

            router.push('/');
          },
        });
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      console.error('Error:', JSON.stringify(err, null, 2));
      if (err.errors && err.errors.length > 0) {
        const clerkErrors = err.errors;

        clerkErrors.forEach((error: any) => {
          switch (error.code) {
            case 'form_code_incorrect':
              setErrors((prev) => ({
                ...prev,
                general: 'Incorrect verification code',
              }));
              break;
            case 'verification_failed':
              setErrors((prev) => ({
                ...prev,
                general: 'Too many failed attempts',
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
        // Generic error handling
        setErrors({ general: 'An unexpected error occurred' });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setErrors({ general: '' });
      setSuccessMessage('Verification code sent');
    } catch (error) {
      console.error('Error resending code:', error);
      setErrors({
        general: 'Failed to resend verification code. Please try again.',
      });
    }
  };

  // Display the verification form to capture the OTP code
  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  Verification code
                </Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-12 text-lg text-center tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {errors.general && (
                  <div className="text-sm text-red-600">{errors.general}</div>
                )}

                {successMessage && (
                  <div className="text-sm text-green-600">{successMessage}</div>
                )}
              </div>
              <div className="flex justify-center items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Please check your email for the code.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isVerifying || code.length !== 6}
                className="w-full h-12 text-lg font-semibold"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-primary hover:underline font-medium"
                >
                  Resend code
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const signUpWith = async (strategy: OAuthStrategy) => {
    return signUp
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
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
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
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
                {errors.email && (
                  <div className="text-sm text-red-600">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="grid gap-2 mb-5">
              <Label htmlFor="password">Password</Label>
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

            <div id="clerk-captcha" />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Loading...' : 'Create account'}
            </Button>
          </form>

          <Button
            variant="outline"
            className="w-full mt-3 cursor-pointer"
            onClick={() => signUpWith('oauth_google')}
          >
            Continue with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <a href="sign-in" className="underline underline-offset-4">
              Sign In
            </a>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
