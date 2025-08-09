/**
 * @fileOverview A static list of Bangladeshi recipes.
 */
import recipeData from '@/../bangladeshi_recipes_bangla.json';
import { z } from 'zod';

export interface FullRecipe {
    id: string;
    title: string;
    image_url: string;
    description: string;
    ingredients: string[];
    instructions: {
        step: number;
        description: string;
        time_needed?: string;
    }[];
}

// The starter JSON has some inconsistencies (e.g., instructions can be objects or strings).
// We'll clean it up here.
const cleanRecipes = recipeData.map((recipe, index) => ({
  ...recipe,
  id: `${index + 1}`, // Add a unique ID
  instructions: recipe.instructions
    .map((inst, stepIndex) => {
      if (typeof inst === 'string') {
        return { step: stepIndex + 1, description: inst };
      }
      return inst;
    })
    .filter(inst => inst && typeof inst.description === 'string'),
}));


export const bangladeshiRecipes: FullRecipe[] = cleanRecipes as FullRecipe[];


// Define Zod schemas for structured data. This helps with type safety and validation.
export const RecipeSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(z.string()),
  totalTime: z.number().describe('Total cooking time in minutes.'),
});
export type RecipeSummary = z.infer<typeof RecipeSummarySchema>;


export const RecipeLookupOutputSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
});
export type RecipeLookupOutput = z.infer<typeof RecipeLookupOutputSchema>;


// Helper function to calculate total time from instructions
export function calculateTotalTime(instructions: { step: number; description: string; time_needed?: string }[]): number {
  return instructions.reduce((total, inst) => {
    const timeMatch = inst.time_needed?.match(/(\d+)\s*মিনিট/);
    if (timeMatch) {
      return total + parseInt(timeMatch[1], 10);
    }
    return total;
  }, 0);
}

// Helper to create a recipe summary from a full recipe
export function createRecipeSummary(recipe: FullRecipe): RecipeSummary {
    return {
        id: recipe.id,
        name: recipe.title, // Map title to name for consistency
        ingredients: recipe.ingredients,
        totalTime: calculateTotalTime(recipe.instructions),
    };
}