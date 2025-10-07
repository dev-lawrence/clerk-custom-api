'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Lock } from 'lucide-react';
import Dashboard from './Dashboard';
import { Button } from './ui/button';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="border-b bg-background z-40 fixed w-full border-border/40">
      <div className="container mx-auto flex py-4 items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Lock className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="text-lg font-semibold">Clerk API</span>
        </a>
        <SignedIn>
          <Dashboard />
        </SignedIn>

        <SignedOut>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;
