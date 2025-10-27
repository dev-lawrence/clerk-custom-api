'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface CreatePasskeyButtonProps {
  onSuccess?: () => void;
  onAlreadyExists?: () => void;
}

export function CreatePasskeyButton({
  onSuccess,
  onAlreadyExists,
}: CreatePasskeyButtonProps) {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);

  const createClerkPasskey = async () => {
    if (!isSignedIn) {
      return;
    }

    try {
      await user?.createPasskey();
      toast.success('Passkey created successfully!');
      onSuccess?.();
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.errors && err.errors.length > 0) {
        const clerkErrors = err.errors;

        clerkErrors.forEach((error: any) => {
          switch (error.code) {
            case 'passkey_registration_cancelled':
              toast.error('Passkey registration was cancelled.');
              break;

            case 'session_reverification_required':
              toast.error(
                'Please reauthenticate to add a new passkey. Log out and back in or open your account settings.'
              );
              break;

            case 'passkey_already_exists':
              toast.warning('You already have a registered passkey.');
              onAlreadyExists?.();
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={createClerkPasskey} disabled={loading}>
      {loading ? 'Registering…' : 'Register Passkey'}
    </Button>
  );
}
