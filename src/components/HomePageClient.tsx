'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RecipeLookupOutput } from '@/lib/bangladeshi-recipes';
import { findRecipeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';

import { RecipeSearch } from '@/components/RecipeSearch';
import { RecipeSummary } from '@/components/RecipeSummary';
import { CookingView } from '@/components/CookingView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';

type AppState = 'idle' | 'searching' | 'summary' | 'cooking' | 'finished' | 'error';

// This new component contains all the logic that was previously in page.tsx
export function HomePageClient() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [recipe, setRecipe] = useState<RecipeLookupOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;
    setAppState('searching');
    setError(null);
    // Clear the search param from URL
    router.replace('/', undefined); 
    const result = await findRecipeAction(query);
    if (result.error || !result.data) {
      const errorMessage = result.error || 'রেসিপি খুঁজে পেতে ব্যর্থ.';
      setError(errorMessage);
      setAppState('error');
      toast({
        variant: "destructive",
        title: "অনুসন্ধান ব্যর্থ হয়েছে",
        description: errorMessage,
      });
    } else {
      setRecipe(result.data);
      setAppState('summary');
    }
  }, [toast, router]);

  useEffect(() => {
    const recipeName = searchParams.get('recipe');
    if (recipeName) {
      handleSearch(recipeName);
    }
  }, [searchParams, handleSearch]);
  
  const resetApp = () => {
      setRecipe(null);
      setError(null);
      setAppState('idle');
      router.replace('/', undefined);
  }

  const renderContent = () => {
    switch (appState) {
      case 'idle':
      case 'searching':
        return <RecipeSearch onSearch={handleSearch} isLoading={appState === 'searching'} />;
      case 'summary':
        if (recipe) {
          return <RecipeSummary recipe={recipe} onStart={() => setAppState('cooking')} onGoBack={resetApp} />;
        }
        return null;
      case 'cooking':
        if (recipe) {
          return <CookingView recipe={recipe} onFinish={() => setAppState('finished')} />;
        }
        return null;
       case 'finished':
        return (
             <Card className="w-full max-w-lg text-center animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader>
                    <div className="mx-auto bg-primary/20 rounded-full p-4 w-fit">
                        <PartyPopper className="h-12 w-12 text-primary"/>
                    </div>
                    <CardTitle className="text-3xl mt-4">আপনার খাবার উপভোগ করুন!</CardTitle>
                    <CardDescription>আপনি সফলভাবে রেসিপিটি সম্পন্ন করেছেন।</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-2xl text-primary">{recipe?.title}</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={resetApp} size="lg" className="w-full">একটি নতুন রেসিপি শুরু করুন</Button>
                </CardFooter>
             </Card>
        )
      case 'error':
         return (
             <Card className="w-full max-w-lg text-center animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader>
                    <CardTitle className="text-3xl text-destructive">একটি ত্রুটি ঘটেছে</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error || "কিছু একটা গোলমাল হয়েছে।"}</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={resetApp} size="lg" className="w-full">আবার চেষ্টা করুন</Button>
                </CardFooter>
             </Card>
        )
      default:
        return null;
    }
  };

  return (
    <>
      <main className="flex-grow container mx-auto p-4 flex flex-col items-center justify-center">
        {appState === 'idle' && (
          <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <h1 className="text-5xl font-bold font-headline">
              <span className="text-primary">স্বাদ</span> যাত্রায় স্বাগতম
            </h1>
            <p className="text-muted-foreground text-lg mt-2 max-w-2xl mx-auto">
              আপনার প্রিয় বাংলাদেশী রেসিপি খুঁজুন এবং ধাপে ধাপে রান্নার নির্দেশিকা অনুসরণ করুন। রেসিপি এর তালিকা দেখতে তালিকা তে ক্লিক করুন।
            </p>
          </div>
        )}
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Developed by Atif Hasan © 2025</p>
      </footer>
    </>
  );
}
