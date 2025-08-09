import { Suspense } from 'react';
import { HomePageClient } from '@/components/HomePageClient';
import { Loader2 } from 'lucide-react';

// The main page is now a Server Component.
export default function Home() {
  return (
    // The Suspense boundary is added here.
    // It shows a fallback UI (a loading spinner) while the client component is loading.
    <Suspense fallback={<LoadingState />}>
      <HomePageClient />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="flex-grow flex items-center justify-center">
       <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
    </div>
  )
}
