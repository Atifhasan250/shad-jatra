'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold font-headline mb-4">একটি সমস্যা হয়েছে!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        দুঃখিত, অ্যাপ্লিকেশনটি চালানোর সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। আমরা সমস্যাটি সমাধান করার চেষ্টা করছি।
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} size="lg" className="rounded-full shadow-lg">
          <RefreshCcw className="mr-2 h-4 w-4" /> আবার চেষ্টা করুন
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> হোম পেজে ফিরে যান
          </Link>
        </Button>
      </div>
      {error.digest && (
        <p className="mt-8 text-xs text-muted-foreground font-mono">
          Error Digest: {error.digest}
        </p>
      )}
    </div>
  );
}
