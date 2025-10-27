'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Trash2, KeyRound, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CreatePasskeyButton } from './CustomCreatePasskeysButton';

export default function PasskeyManagement() {
  const { user } = useUser();
  const [passkeys, setPasskeys] = useState(user?.passkeys || []);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!user) return null;

  const refreshPasskeys = async () => {
    await user.reload();
    setPasskeys(user.passkeys);
  };

  const handleDelete = async (id: string) => {
    const pkToDelete = passkeys.find((pk: any) => pk.id === id);
    if (!pkToDelete) return;

    try {
      await pkToDelete.delete();
      setPasskeys(passkeys.filter((p: any) => p.id !== id));
      toast.success('Passkey deleted successfully');
    } catch (error) {
      console.error('Error deleting passkey:', error);
      toast.error('Failed to delete passkey');
    }
  };

  const handleRename = async (id: string) => {
    const pkToRename = passkeys.find((pk: any) => pk.id === id);
    if (!pkToRename) {
      toast.error('Passkey not found.');
      return;
    }

    try {
      await pkToRename.update({
        name: newName,
      });

      await user.reload();
      setPasskeys(user.passkeys);
      setRenameId(null);
      setNewName('');
      toast.success('Passkey renamed successfully!');
    } catch (error) {
      console.error('Rename error:', error);
      toast.error('Failed to rename passkey.');
      return;
    }
  };

  return (
    <Card className="mt-10 border bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Passkey Management
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Passkey
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a New Passkey</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mb-4">
                You’ll be prompted by your browser to register a new passkey.
              </p>
              <CreatePasskeyButton
                onSuccess={async () => {
                  setDialogOpen(false);
                  await refreshPasskeys();
                }}
                onAlreadyExists={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {passkeys.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No passkeys registered yet.
          </p>
        )}

        <div className="space-y-4">
          {passkeys.map((pk: any, index: number) => (
            <div key={pk.id}>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <KeyRound className="text-primary h-5 w-5" />
                  <div>
                    {renameId === pk.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newName}
                          placeholder="Enter new name"
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-[200px]"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRename(pk.id)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">
                          {pk.name || 'Unnamed Passkey'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(pk.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setRenameId(pk.id);
                      setNewName(pk.name);
                    }}
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Delete Passkey</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground mb-4">
                        Are you sure you want to delete{' '}
                        <strong>{pk.name || 'this passkey'}</strong>? This
                        action cannot be undone.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(pk.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {index < passkeys.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
