
'use server';

import { bangladeshiRecipes, calculateTotalTime, createRecipeSummary } from '@/lib/bangladeshi-recipes';
import type { RecipeLookupOutput, RecipeSummary } from '@/lib/bangladeshi-recipes';


// This logic is now handled directly here instead of a flow.
async function recipeLookup(
    { recipeName }: { recipeName: string }
): Promise<RecipeLookupOutput | null> {
    const lowerCaseQuery = recipeName.toLowerCase();
    const fullRecipe = bangladeshiRecipes.find(
      (recipe) => recipe.title.toLowerCase().includes(lowerCaseQuery)
    );

    if (!fullRecipe) {
        return null;
    }
    
    const formattedInstructions = fullRecipe.instructions.map(
        (inst) => inst.description
    );

    return {
        title: fullRecipe.title,
        ingredients: fullRecipe.ingredients,
        instructions: formattedInstructions,
    };
}


// This logic is now handled directly here instead of a flow.
async function listAllRecipes(): Promise<RecipeSummary[]> {
    return bangladeshiRecipes.map(createRecipeSummary);
}

// This logic is now handled directly here instead of a flow.
async function searchRecipes(query: string): Promise<RecipeSummary[]> {
    const lowerCaseQuery = query.toLowerCase();
    const results = bangladeshiRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(lowerCaseQuery) ||
        recipe.description.toLowerCase().includes(lowerCaseQuery) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerCaseQuery))
    );
    return results.map(createRecipeSummary);
}


export async function findRecipeAction(
  recipeName: string
): Promise<{ data: RecipeLookupOutput | null; error: string | null }> {
  if (!recipeName) {
    return { data: null, error: 'অনুগ্রহ করে একটি রেসিপির নাম লিখুন।' };
  }
  try {
    const result = await recipeLookup({ recipeName });
    if (!result) {
      return { data: null, error: `"${recipeName}" এর জন্য একটি রেসিপি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে রেসিপি তালিকায় এটি অনুসন্ধান করার চেষ্টা করুন।`};
    }
    if (!result.title || result.ingredients.length === 0 || result.instructions.length === 0) {
      return { data: null, error: `"${recipeName}" এর জন্য একটি সম্পূর্ণ রেসিপি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে অন্য একটি চেষ্টা করুন।`};
    }
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন.' };
  }
}

export async function listAllRecipesAction(): Promise<{ data: RecipeSummary[] | null; error: string | null; }> {
    try {
        const result = await listAllRecipes();
        return { data: result, error: null };
    } catch(e) {
        console.error(e);
        return { data: null, error: 'রেসিপি আনতে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন.' };
    }
}

export async function searchRecipesAction(query: string): Promise<{ data: RecipeSummary[] | null; error: string | null; }> {
    if (!query) {
        return listAllRecipesAction();
    }
    try {
        const result = await searchRecipes(query);
        return { data: result, error: null };
    } catch(e) {
        console.error(e);
        return { data: null, error: 'রেসিপি অনুসন্ধান করার সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন.' };
    }
}

// Dummy action for now
export async function textToSpeechAction(text: string): Promise<{ data: { audioDataUri: string } | null; error: string | null }> {
    return { data: null, error: 'Text to speech is currently disabled.' };
}
