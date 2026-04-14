'use client';

import { useState, useRef, useCallback } from 'react';
import type { RecipeSummary } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Clock, Utensils, Heart, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';

const QUICK_CATEGORIES = [
  { name: 'বিরিয়ানি', emoji: '🍛' },
  { name: 'মাছ', emoji: '🐟' },
  { name: 'মাংস', emoji: '🍗' },
  { name: 'ভর্তা', emoji: '🥣' },
  { name: 'মিষ্টি', emoji: '🍰' },
  { name: 'নাস্তা', emoji: '☕' },
];

export function HomePageClient({ featuredRecipes = [] }: { featuredRecipes?: RecipeSummary[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/recipelist?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = window.innerWidth < 768 ? 300 : 340;
    scrollContainerRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-20 w-full animate-in fade-in duration-700 overflow-x-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-20 md:pb-28 px-4">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-gradient-mesh opacity-30 dark:opacity-20 translate-y-[-20%]" />
        </div>
        
        <div className="container mx-auto max-w-5xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Badge className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all text-sm font-semibold mb-4">
            ✨ আপনার রসুইঘরে বাংলার ঐতিহ্য
          </Badge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline leading-[1.1] tracking-tight text-foreground">
            আজ কী রান্না <br />
            <span className="text-primary italic">করবেন?</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            হাজারো বাংলাদেশী রেসিপি থেকে আপনার পছন্দের পদটি খুঁজে নিন। 
            সহজ নির্দেশিকা আর স্মার্ট টাইমার দিয়ে রান্না হবে আনন্দময়।
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center p-1.5 rounded-3xl bg-card border-2 border-border shadow-2xl focus-within:border-primary/50 transition-all">
              <Search className="absolute left-6 h-6 w-6 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="রেসিপির নাম বা উপকরণ লিখুন..."
                className="pl-14 pr-24 h-14 text-lg border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button 
                type="submit" 
                className="absolute right-1.5 rounded-xl h-11 px-6 text-base font-bold shadow-lg hover:shadow-primary/20 transition-all"
              >
                খুঁজুন
              </Button>
            </div>
            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span>জনপ্রিয়:</span>
              <button type="button" onClick={() => router.push('/recipelist?q=বিরিয়ানি')} className="hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4 font-medium">কাচ্চি বিরিয়ানি</button>
              <button type="button" onClick={() => router.push('/recipelist?q=ইলিশ')} className="hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4 font-medium">সরিষা ইলিশ</button>
              <button type="button" onClick={() => router.push('/recipelist?q=পুরি')} className="hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4 font-medium">আলুর পুরি</button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-headline">ক্যাটাগরি সমূহ</h2>
          <Button variant="ghost" className="text-primary gap-1" onClick={() => router.push('/recipelist')}>
             সব দেখুন <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {QUICK_CATEGORIES.map((cat) => (
            <Card 
              key={cat.name} 
              className="group cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-lg border-primary/10 bg-card overflow-hidden"
              onClick={() => router.push(`/recipelist?category=${cat.name}`)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{cat.emoji}</span>
                <span className="font-bold text-lg">{cat.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Recipes - Carousel with Arrow Buttons */}
      <section className="bg-muted/30 py-16 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold font-headline mb-2">বিশেষ রেসিপি</h2>
              <p className="text-muted-foreground">সবচেয়ে জনপ্রিয় এবং সেরা রেসিপিগুলো একবার দেখে নিন।</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-primary/40 text-primary hover:bg-primary/10 shadow-sm" 
                onClick={() => scrollCarousel('left')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-primary/40 text-primary hover:bg-primary/10 shadow-sm" 
                onClick={() => scrollCarousel('right')}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="default" 
                className="hidden md:flex rounded-full gap-2 shadow-lg shadow-primary/20 ml-2" 
                onClick={() => router.push('/recipelist')}
              >
                আরো রেসিপি দেখুন <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-2 px-[10%] md:px-0 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          >
            {featuredRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="flex-shrink-0 w-[280px] md:w-[320px] group cursor-pointer snap-center"
                onClick={() => router.push(`/recipe/${recipe.id}`)}
              >
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl mb-4 bg-card">
                  <Image 
                    src={recipe.image_url} 
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity" />
                  
                  <div className="absolute top-4 right-4 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-5 w-5" />
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <Badge className="bg-primary/90 hover:bg-primary border-none">{recipe.category}</Badge>
                    <h3 className="text-xl md:text-2xl font-bold font-headline leading-tight drop-shadow-md line-clamp-2">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.totalTimeMinutes} মিনিট</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Utensils className="h-4 w-4" />
                        <span>{recipe.ingredientsCount} উপকরণ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="container mx-auto px-4 max-w-5xl py-12">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 fill-primary" />
            </div>
            <h3 className="text-xl font-bold">সহজ রান্নার নির্দেশিকা</h3>
            <p className="text-muted-foreground">রান্নার প্রতিটি ধাপ সহজবোধ্য ভাবে লিখা হয়েছে যাতে নতুনদের রান্নার প্রতি আগ্রহ তৈরি হয়।</p>
          </div>
          <div className="space-y-4">
            <div className="h-16 w-16 bg-green-500/10 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">স্মার্ট টাইমার</h3>
            <p className="text-muted-foreground">রান্নার নির্দেশিকার সাথে সংযুক্ত টাইমার আপনাকে নিখুঁত খাবার রান্না করতে সাহায্য করবে।</p>
          </div>
          <div className="space-y-4">
            <div className="h-16 w-16 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 fill-rose-600" />
            </div>
            <h3 className="text-xl font-bold">ব্যক্তিগত ডায়েরি</h3>
            <p className="text-muted-foreground">আপনার পছন্দের রেসিপিগুলো প্রিয় তালিকায় যুক্ত করুন এবং যেকোনো সময় ফিরে আসুন।</p>
          </div>
        </div>
      </section>
      
      <footer className="container mx-auto px-4 max-w-5xl text-center pt-20 border-t border-border">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">বাংলাদেশী খাবারের স্বাদ ঘরে ঘরে পৌঁছে দেয়ার একটি বিনম্র প্রচেষ্টা।</p>
          <div className="flex justify-center gap-6 mt-8 mb-8 text-muted-foreground font-medium">
            <a href="https://www.facebook.com/atifhasan250" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">ফেসবুক</a>
            <a href="https://github.com/Atifhasan250" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">গিটহাব</a>
            <a href="https://www.instagram.com/_atif_hasan_" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">ইনস্টাগ্রাম</a>
          </div>
          <p className="text-sm text-neutral-500">
            স্বাদ যাত্রা © 2025 | Developed with ❤️ by <a href="https://atifs-info.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Atif Hasan</a>
          </p>
      </footer>
    </div>
  );
}
