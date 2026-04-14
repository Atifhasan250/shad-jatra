import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findRecipeAction } from '@/app/actions';
import { CookingView } from '@/components/CookingView';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Utensils } from 'lucide-react';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: recipe } = await findRecipeAction(id);
  if (!recipe) return {};

  return {
    title: `${recipe.title} — রেসিপি | স্বাদ যাত্রা`,
    description: recipe.description?.substring(0, 155),
    openGraph: {
      images: [recipe.image_url],
    },
  };
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: recipe, error } = await findRecipeAction(id);

  if (error || !recipe) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.image_url,
    recipeCategory: recipe.category,
    recipeYield: recipe.servings,
    totalTime: `PT${recipe.totalTimeMinutes}M`,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((inst: any) => ({
      '@type': 'HowToStep',
      text: inst.description,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-border">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-primary hover:bg-primary shadow-lg">{recipe.category}</Badge>
            <Badge variant="secondary" className="shadow-lg">{recipe.difficulty}</Badge>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4 leading-tight">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {recipe.description}
          </p>
          
          <div className="flex flex-wrap gap-6 mb-8 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">সময়</p>
                <p className="font-medium">{recipe.totalTimeMinutes} মিনিট</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">পরিবেশন</p>
                <p className="font-medium">{recipe.servings} জন</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">উপকরণ</p>
                <p className="font-medium">{recipe.ingredients.length} টি</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            উপকরণ তালিকা
          </h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-transparent hover:border-border transition-colors">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-lg">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">রান্না শুরু করুন</h2>
          <CookingView recipe={recipe} />
        </div>
      </div>
    </div>
  );
}
