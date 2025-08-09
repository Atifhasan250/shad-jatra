'use client';

import type { RecipeLookupOutput } from '@/ai/flows/recipe-lookup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, Flame, ListChecks } from 'lucide-react';

type RecipeSummaryProps = {
  recipe: RecipeLookupOutput;
  onStart: () => void;
  onGoBack: () => void;
};

export function RecipeSummary({ recipe, onStart, onGoBack }: RecipeSummaryProps) {
  return (
    <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-3xl lg:text-4xl text-primary">{recipe.title}</CardTitle>
        <CardDescription>রান্না শুরু করতে প্রস্তুত? আপনার যা যা লাগবে তা এখানে।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around text-center">
            <div className="flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-muted-foreground" />
                <div>
                    <div className="font-bold text-xl">{recipe.instructions.length}</div>
                    <div className="text-sm text-muted-foreground">ধাপ</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-muted-foreground" />
                <div>
                    <div className="font-bold text-xl">{recipe.ingredients.length}</div>
                    <div className="text-sm text-muted-foreground">উপকরণ</div>
                </div>
            </div>
        </div>
        <Separator />
        <div>
            <h3 className="font-semibold text-xl mb-3">উপকরণ</h3>
            <ScrollArea className="h-48 rounded-md border p-4">
                <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                            <span>{ingredient}</span>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-4">
        <Button onClick={onGoBack} variant="outline" size="lg" className="w-full sm:w-auto">ফিরে যান</Button>
        <Button onClick={onStart} size="lg" className="w-full sm:w-auto">রান্না শুরু করুন</Button>
      </CardFooter>
    </Card>
  );
}
