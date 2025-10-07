'use client';

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Lock className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-semibold">Clerk API</span>
          </div>
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

      <main className="flex flex-1 items-center justify-center px-6 py-12 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <SignedOut>
            <div className="flex flex-col items-center text-center max-w-[700px] mx-auto">
              <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
                Still using the default Clerk UI? 😂
              </h1>
              <p className="mb-8 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                Build your own vibe. Clerk just provides the tools.
              </p>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col items-center text-center">
              <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Welcome back Nerd!
              </h1>
              <p className="mb-8 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                Your session is secure and ready to use.
              </p>
            </div>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
