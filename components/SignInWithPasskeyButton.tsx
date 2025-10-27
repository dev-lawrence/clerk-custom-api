'use client';

import { useSignIn } from '@clerk/nextjs';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
export function SignInWithPasskeyButton() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  if (!signIn) return;

  const signInWithPasskey = async () => {
    // 'discoverable' lets the user choose a passkey
    // without auto-filling any of the options
    try {
      const signInAttempt = await signIn?.authenticateWithPasskey({
        flow: 'discoverable',
      });

      if (signInAttempt?.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          redirectUrl: '/',
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.push('/');
          },
        });
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.errors && err.errors.length > 0) {
        const clerkErrors = err.errors;

        clerkErrors.forEach((error: any) => {
          switch (error.code) {
            case 'passkey_not_registered':
              toast.error('Passkey is not registered..');
              break;

            default:
              toast.error(
                'An unexpected error occurred during passkey creation.'
              );
          }
        });
      } else {
        toast.error('An unexpected error occurred during passkey creation.');
      }
    }
  };

  return <Button onClick={signInWithPasskey}>Sign in with passkey</Button>;
}
