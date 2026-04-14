import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getFavouritesAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, ChefHat, Clock, Utensils, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default async function FavouritesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { data: recipes, error } = await getFavouritesAction();

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2">আপনার প্রিয় রেসিপি</h1>
          <p className="text-muted-foreground">আপনার পছন্দের সংরক্ষিত রেসিপিগুলো এখানে রয়েছে।</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/recipelist" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> আরও রেসিপি খুঁজুন
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl text-center">
          <p>{error}</p>
        </div>
      ) : recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <Link href={`/recipe/${recipe.id}`} key={recipe.id}>
              <Card className="flex flex-col overflow-hidden border-border hover:border-primary group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image 
                    src={recipe.image_url} 
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="rounded-full bg-background/80 backdrop-blur-sm h-10 w-10 shadow-lg flex items-center justify-center text-accent">
                      <Heart className="h-5 w-5 fill-accent" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-primary/90 hover:bg-primary backdrop-blur-sm">{recipe.category}</Badge>
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
                  
                  <Button className="w-full mt-auto rounded-xl h-11 transition-all group-hover:bg-primary">
                    <span>রান্না করুন</span>
                    <ChefHat className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <div className="text-6xl mb-4">❤️</div>
          <p className="text-xl font-medium">আপনার প্রিয় তালিকায় কোনো রেসিপি নেই</p>
          <p className="text-muted-foreground mt-2">রেসিপি তালিকা থেকে আপনার পছন্দের রেসিপিগুলো এখানে জমা করতে পারেন।</p>
          <Button asChild className="mt-8 rounded-full px-8">
            <Link href="/recipelist">রেসিপিগুলো দেখুন</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
