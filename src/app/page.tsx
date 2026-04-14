import { Suspense } from 'react';
import { HomePageClient } from '@/components/HomePageClient';
import { Loader2 } from 'lucide-react';
import { getRandomRecipesAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: featuredRecipes } = await getRandomRecipesAction(5);

  return (
    <Suspense fallback={<LoadingState />}>
      <HomePageClient featuredRecipes={featuredRecipes || []} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[60vh]">
       <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
    </div>
  )
}
