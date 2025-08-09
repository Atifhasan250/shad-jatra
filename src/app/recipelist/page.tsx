
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { listAllRecipesAction, searchRecipesAction } from '@/app/actions';
import type { RecipeSummary } from '@/ai/flows/recipe-list';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ChefHat, Utensils, AlertTriangle, RefreshCw, Clock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [isSearching, startSearchTransition] = useTransition();

  const loadInitialRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await listAllRecipesAction();
    if (error) {
      setError(error);
    } else if (data) {
      setRecipes(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInitialRecipes();
  }, [loadInitialRecipes]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    startSearchTransition(async () => {
      if (term.trim() === '') {
        loadInitialRecipes();
        return;
      }
      const { data, error } = await searchRecipesAction(term);
       if (error) {
        setError(error);
      } else if (data) {
        setRecipes(data);
      }
    });
  };
  
  const handleRecipeSelect = (recipeName: string) => {
    router.push(`/?recipe=${encodeURIComponent(recipeName)}`);
  };

  const currentLoaderText = isSearching ? 'অনুসন্ধান করা হচ্ছে...' : 'রেসিপি আনা হচ্ছে...';

  return (
    <>
      <main className="container mx-auto p-4 flex flex-col flex-grow">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-4xl font-bold font-headline text-primary">বাংলাদেশী রেসিপি লাইব্রেরি</h1>
          <p className="text-muted-foreground text-lg">আপনার পরবর্তী রান্নার রেসিপির জন্য অনুসন্ধান করুন।</p>
        </div>
        
        <div className="relative mb-6 max-w-lg mx-auto w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="যেকোনো বাংলাদেশী রেসিপি খুঁজুন..."
            className="pl-10 text-lg h-14"
          />
          {(isLoading || isSearching) && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
        </div>

        {isLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">{currentLoaderText}</p>
          </div>
        ) : error ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
              <Card className="w-full max-w-md">
                  <CardHeader className="items-center">
                      <div className="p-3 rounded-full bg-destructive/10">
                          <AlertTriangle className="h-8 w-8 text-destructive"/>
                      </div>
                      <CardTitle className="text-destructive">রেসিপি লোড করতে ব্যর্থ</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground">{error}</p>
                      <Button onClick={loadInitialRecipes} className="mt-6">
                          <RefreshCw className="mr-2 h-4 w-4"/>
                          আবার চেষ্টা করুন
                      </Button>
                  </CardContent>
              </Card>
          </div>
        ) : (
          <div className="flex-grow">
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recipes.map(recipe => (
                      <Card key={recipe.id} className="flex flex-col overflow-hidden hover:border-primary transition-colors group">
                          <CardHeader>
                              <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{recipe.name}</CardTitle>
                               <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                  <div className="flex items-center gap-2">
                                      <Utensils className="h-4 w-4" />
                                      <span>{recipe.ingredients.length} উপকরণ</span>
                                  </div>
                                  {recipe.totalTime > 0 && (
                                      <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          <span>{recipe.totalTime} মিনিট</span>
                                      </div>
                                  )}
                              </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 flex flex-col flex-grow">
                             <div className="flex-grow space-y-2 text-sm mb-4">
                                  <p className="font-semibold">উপকরণ:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                  {recipe.ingredients.slice(0, 3).map((ing, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                          <Check className="h-4 w-4 text-primary/50 flex-shrink-0 mt-1"/>
                                          <span>{ing}</span>
                                      </li>
                                  ))}
                                  </ul>
                             </div>
                             <Button 
                                  onClick={() => handleRecipeSelect(recipe.name)} 
                                  className="w-full mt-auto"
                              >
                                  <ChefHat className="mr-2 h-4 w-4"/>
                                  এটি রান্না করুন
                              </Button>
                          </CardContent>
                      </Card>
                  ))}
              </div>
            ) : (
               <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">"{searchTerm}" এর জন্য কোন রেসিপি পাওয়া যায়নি।</p>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Developed by Atif Hasan © 2025</p>
      </footer>
    </>
  );
}
