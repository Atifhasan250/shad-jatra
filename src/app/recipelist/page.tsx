'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { listAllRecipesAction, searchRecipesAction, filterRecipesAction, toggleFavouriteAction, isFavouriteAction, deleteRecipeAction, isAdminAction, bulkDeleteRecipesAction } from '@/app/actions';import type { RecipeSummary } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ChefHat, Utensils, AlertTriangle, RefreshCw, Clock, Check, Heart, Trash2, CheckSquare, Square, X, Trash } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecipeCardSkeleton } from '@/components/RecipeCardSkeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

const CATEGORIES = ['সব', 'বিরিয়ানি', 'মাছ', 'মাংস', 'ভর্তা', 'মিষ্টি', 'নাস্তা', 'সবজি', 'ডাল', 'অন্যান্য'];

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [selectedDifficulty, setSelectedDifficulty] = useState('সব');
  const [favourites, setFavourites] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const hasInitialized = useRef(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();

  const loadRecipes = useCallback(async (filters: { query: string; category: string; difficulty: string }) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await filterRecipesAction(filters);
    
    if (error) {
      setError(error);
    } else if (data) {
      setRecipes(data);
    }
    setIsLoading(false);
  }, []);

  // Read URL params ONLY on initial mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'সব';
    
    if (q) setSearchTerm(q);
    if (cat !== 'সব') setSelectedCategory(cat);
    
    loadRecipes({
      query: q,
      category: cat,
      difficulty: 'সব'
    });

    const checkAdmin = async () => {
      const admin = await isAdminAction();
      setIsAdmin(admin);
    };
    checkAdmin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const handleFilterChange = (type: 'category' | 'difficulty' | 'query', value: string) => {
    if (type === 'query') setSearchTerm(value);
    if (type === 'category') setSelectedCategory(value);
    if (type === 'difficulty') setSelectedDifficulty(value);

    // Debounce search if it's a query
    const debounceTime = type === 'query' ? 300 : 0;

    const performFilter = () => {
      const newFilters = {
        query: type === 'query' ? value : searchTerm,
        category: type === 'category' ? value : selectedCategory,
        difficulty: type === 'difficulty' ? value : selectedDifficulty
      };

      // Update URL without full refresh to keep browser history in sync
      const params = new URLSearchParams();
      if (newFilters.query) params.set('q', newFilters.query);
      if (newFilters.category !== 'সব') params.set('category', newFilters.category);
      if (newFilters.difficulty !== 'সব') params.set('difficulty', newFilters.difficulty);
      
      const newUrl = params.toString() ? `/recipelist?${params.toString()}` : '/recipelist';
      window.history.replaceState(null, '', newUrl);

      startTransition(async () => {
        const { data, error } = await filterRecipesAction(newFilters);
        if (data) setRecipes(data);
      });
    };

    if (debounceTime) {
      const timeoutId = setTimeout(performFilter, debounceTime);
      return () => clearTimeout(timeoutId);
    } else {
      performFilter();
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelectId = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(recipes.map(r => r.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setIsDeletingBulk(true);
    const { success, error } = await bulkDeleteRecipesAction(Array.from(selectedIds));
    if (success) {
      setRecipes(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      toast({ title: "সফল", description: "নির্বাচিত রেসিপিগুলো ডিলিট করা হয়েছে" });
    } else {
      toast({ variant: "destructive", title: "ত্রুটি", description: error });
    }
    setIsDeletingBulk(false);
  };

  const handleToggleFavourite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const { success, error } = await toggleFavouriteAction(id);
    if (success) {
      setFavourites(prev => ({ ...prev, [id]: !prev[id] }));
      toast({
        title: favourites[id] ? "সরানো হয়েছে" : "প্রিয়তে যোগ হয়েছে ❤️",
        duration: 2000,
      });
    } else {
      toast({
        title: "ত্রুটি",
        description: error || "একটি সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const { success, error } = await deleteRecipeAction(id);
      if (success) {
        setRecipes(prev => prev.filter(r => r.id !== id));
        toast({
          title: "সাফল্য!",
          description: "রেসিপিটি মুছে ফেলা হয়েছে।",
        });
      } else {
        toast({
          variant: "destructive",
          title: "ত্রুটি",
          description: error || "মুছে ফেলতে সমস্যা হয়েছে।",
        });
      }
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col min-h-screen max-w-7xl">
      <div className="space-y-4 mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground tracking-tight">
          বাংলাদেশী রেসিপি সংগ্রহশালা
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          আপনার পছন্দমতো রেসিপি খুঁজুন এবং আজই নতুন কিছু রান্না করুন।
        </p>
      </div>
      
      <div className="py-8 border-b border-border mb-12">
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={searchTerm}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              placeholder="যেকোনো বাংলাদেশী রেসিপি খুঁজিন..."
              className="pl-12 text-lg h-14 bg-card border-2 border-transparent focus:border-primary/50 transition-all rounded-2xl shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Chips */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('category', cat)}
                  className={`rounded-full px-5 h-9 font-medium transition-all ${
                    selectedCategory === cat 
                      ? 'bg-primary text-primary-foreground border-transparent shadow-md' 
                      : 'bg-card text-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-transparent'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Difficulty Dropdown & Admin Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">কঠিনতা:</span>
              <Select value={selectedDifficulty} onValueChange={(v) => handleFilterChange('difficulty', v)}>
                <SelectTrigger className="w-full md:w-[140px] h-9 rounded-full bg-secondary border-none">
                  <SelectValue placeholder="সব" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="সব">সব</SelectItem>
                  <SelectItem value="সহজ">সহজ</SelectItem>
                  <SelectItem value="মাঝারি">মাঝারি</SelectItem>
                  <SelectItem value="কঠিন">কঠিন</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>
        </div>

        {/* Multi-Select Toolbar (Sticky below filters) */}
        {isSelectionMode && (
          <div className="max-w-5xl mx-auto mt-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-primary">
                {selectedIds.size} টি সিলেক্ট করা হয়েছে
              </span>
              <div className="h-4 w-px bg-primary/20 hidden sm:block" />
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 text-xs font-bold hover:bg-primary/10">
                সব সিলেক্ট
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDeselectAll} className="h-8 text-xs font-bold hover:bg-primary/10">
                সব ডিসিলেক্ট
              </Button>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  disabled={selectedIds.size === 0 || isDeletingBulk}
                  className="h-8 text-xs font-bold rounded-xl shadow-lg shadow-destructive/20"
                >
                  {isDeletingBulk ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Trash className="h-3 w-3 mr-2" />}
                  ডিলিট করুন ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                  <AlertDialogDescription>
                    আপনি বাছাই করা {selectedIds.size} টি রেসিপি স্থায়ীভাবে ডিলিট করতে যাচ্ছেন। এটি আর ফিরে পাওয়া সম্ভব নয়।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    এখনই ডিলিট করুন
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-between items-center text-muted-foreground">
        <p className="font-medium">
          {isPending ? 'ফিল্টার করা হচ্ছে...' : `${recipes.length} টি রেসিপি পাওয়া গেছে`}
        </p>
        
        {isAdmin && (
          <Button 
            variant={isSelectionMode ? "secondary" : "outline"}
            size="sm"
            onClick={toggleSelectionMode}
            className={`rounded-xl px-4 h-9 font-bold transition-all ${
              isSelectionMode ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-card border-primary/10 text-primary hover:bg-primary/5'
            }`}
          >
            {isSelectionMode ? <X className="h-4 w-4 mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
            {isSelectionMode ? "বাতিল" : "সিলেক্ট"}
          </Button>
        )}
      </div>

      <div className="flex-grow">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <RecipeCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-destructive/10 mb-4 text-destructive">
                <AlertTriangle className="h-10 w-10"/>
            </div>
            <h3 className="text-xl font-bold mb-2">রেসিপি লোড করতে ব্যর্থ</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => loadRecipes({ query: searchTerm, category: selectedCategory, difficulty: selectedDifficulty })} className="rounded-full px-8">
                <RefreshCw className="mr-2 h-4 w-4"/> পুনরায় চেষ্টা করুন
            </Button>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map(recipe => (
              <Card 
                key={recipe.id} 
                className={`flex flex-col overflow-hidden border-border hover:border-primary group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer relative ${
                  isSelectionMode && selectedIds.has(recipe.id) ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
                }`}
                onClick={() => isSelectionMode ? toggleSelectId(recipe.id) : router.push(`/recipe/${recipe.id}`)}
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  {isSelectionMode && (
                    <div className="absolute inset-0 bg-primary/5 z-[5] pointer-events-none" />
                  )}
                  <Image 
                    src={recipe.image_url} 
                    alt={recipe.title}
                    fill
                    className={`object-cover transition-transform duration-500 ${isSelectionMode ? 'opacity-80' : 'group-hover:scale-105'}`}
                    loading="lazy"
                  />
                  
                  {isSelectionMode && (
                    <div className="absolute top-3 left-3 z-30 animate-in zoom-in-50">
                      <div className={`p-1.5 rounded-full shadow-lg transition-all ${
                        selectedIds.has(recipe.id) ? 'bg-primary text-white scale-110' : 'bg-white/90 text-primary'
                      }`}>
                        {selectedIds.has(recipe.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {!isSelectionMode && (
                      <>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="rounded-full bg-background/80 dark:bg-black/50 backdrop-blur-md h-10 w-10 shadow-xl border border-white/20 hover:scale-110 transition-all duration-300"
                          onClick={(e) => handleToggleFavourite(e, recipe.id)}
                        >
                          <Heart className={`h-5 w-5 ${favourites[recipe.id] ? 'fill-rose-500 text-rose-500' : 'text-foreground'}`} />
                        </Button>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="rounded-full h-10 w-10 shadow-lg border border-destructive/20 hover:scale-110 transition-all duration-300"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl" onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  এই রেসিপিটি ডিলিট করলে তা আর ফিরে পাওয়া সম্ভব নয়।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(recipe.id);
                                  }} 
                                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  ডিলিট করুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <Badge className="bg-primary text-primary-foreground shadow-sm">{recipe.category}</Badge>
                    <Badge variant="secondary" className="bg-background/90 dark:bg-card/90 backdrop-blur-sm font-bold text-foreground border border-border/50">
                       {recipe.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors line-clamp-1">
                    {recipe.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{recipe.totalTimeMinutes} মিনিট</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Utensils className="h-4 w-4 text-primary" />
                      <span>{recipe.ingredientsCount} উপকরণ</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-auto rounded-xl h-11 transition-all group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30"
                  >
                    <span>রান্না করুন</span>
                    <ChefHat className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-medium">কোন রেসিপি পাওয়া যায়নি</p>
            <p className="text-muted-foreground mt-2">অন্য কিছু দিয়ে বা অন্য ক্যাটাগরিতে খুঁজে দেখুন।</p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-full" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('সব');
                setSelectedDifficulty('সব');
              }}
            >
              সব ফিল্টার মুছুন
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
