'use server';

import { connectDB } from '@/lib/db';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export type RecipeSummary = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  difficulty: string;
  totalTimeMinutes: number;
  ingredientsCount: number;
  viewCount: number;
};

function mapToSummary(recipe: any): RecipeSummary {
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    image_url: recipe.image_url,
    category: recipe.category,
    difficulty: recipe.difficulty,
    totalTimeMinutes: recipe.totalTimeMinutes,
    ingredientsCount: recipe.ingredients.length,
    viewCount: recipe.viewCount || 0,
  };
}

export async function listAllRecipesAction(): Promise<{ data: RecipeSummary[] | null; error: string | null }> {
  try {
    await connectDB();
    const recipes = await Recipe.find({ isApproved: true }).sort({ createdAt: -1 });
    return { data: recipes.map(mapToSummary), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'রেসিপি আনতে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।' };
  }
}

export async function getRandomRecipesAction(count: number = 5): Promise<{ data: RecipeSummary[] | null; error: string | null }> {
  try {
    await connectDB();
    const recipes = await Recipe.aggregate([
      { $match: { isApproved: true } },
      { $sample: { size: count } }
    ]);
    return { data: recipes.map(mapToSummary), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'রেসিপি আনতে সমস্যা হয়েছে।' };
  }
}

export async function searchRecipesAction(query: string): Promise<{ data: RecipeSummary[] | null; error: string | null }> {
  try {
    await connectDB();
    let recipes;
    if (!query) {
      recipes = await Recipe.find({ isApproved: true }).sort({ createdAt: -1 });
    } else {
      recipes = await Recipe.find(
        { $text: { $search: query }, isApproved: true },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    }
    return { data: recipes.map(mapToSummary), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'রেসিপি অনুসন্ধান করার সময় একটি সমস্যা হয়েছে।' };
  }
}

export async function filterRecipesAction(filters: { category?: string, difficulty?: string, query?: string }): Promise<{ data: RecipeSummary[] | null; error: string | null }> {
  try {
    await connectDB();
    const query: any = { isApproved: true };
    
    if (filters.category && filters.category !== 'সব') {
      query.category = filters.category;
    }
    
    if (filters.difficulty && filters.difficulty !== 'সব') {
      query.difficulty = filters.difficulty;
    }
    
    if (filters.query) {
      query.$text = { $search: filters.query };
    }
    
    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    return { data: recipes.map(mapToSummary), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'রেসিপি ফিল্টার করার সময় একটি সমস্যা হয়েছে।' };
  }
}

export async function findRecipeAction(id: string): Promise<{ data: any | null; error: string | null }> {
  try {
    await connectDB();
    const recipe = await Recipe.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { returnDocument: 'after' });
    if (!recipe) return { data: null, error: 'রেসিপি পাওয়া যায়নি।' };
    return { data: JSON.parse(JSON.stringify(recipe)), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'রেসিপি লোড করার সময় একটি সমস্যা হয়েছে।' };
  }
}

export async function toggleFavouriteAction(recipeId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'লগইন প্রয়োজন।' };
    
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      await User.create({
        clerkId: userId,
        favouriteRecipeIds: [recipeId],
      });
    } else {
      const index = user.favouriteRecipeIds.indexOf(recipeId);
      if (index > -1) {
        user.favouriteRecipeIds.splice(index, 1);
      } else {
        user.favouriteRecipeIds.push(recipeId);
      }
      await user.save();
    }
    
    revalidatePath('/favourites');
    return { success: true, error: null };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'প্রিয় তালিকায় যোগ করতে সমস্যা হয়েছে।' };
  }
}

export async function getFavouritesAction(): Promise<{ data: RecipeSummary[] | null; error: string | null }> {
  try {
    const { userId } = await auth();
    if (!userId) return { data: null, error: 'লগইন প্রয়োজন।' };
    
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.favouriteRecipeIds.length === 0) return { data: [], error: null };
    
    const recipes = await Recipe.find({ _id: { $in: user.favouriteRecipeIds } });
    return { data: recipes.map(mapToSummary), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'প্রিয় রেসিপি আনতে সমস্যা হয়েছে।' };
  }
}

export async function isFavouriteAction(recipeId: string): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    return user ? user.favouriteRecipeIds.includes(recipeId) : false;
  } catch (e) {
    return false;
  }
}

export async function submitRecipeAction(data: any): Promise<{ success: boolean; error: string | null }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'লগইন প্রয়োজন।' };
    
    await connectDB();
    await Recipe.create({
      ...data,
      authorId: userId,
      isApproved: false,
    });
    
    return { success: true, error: null };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'রেসিপি জমা দিতে সমস্যা হয়েছে।' };
  }
}

export async function approveRecipeAction(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { userId } = await auth();
    if (userId !== process.env.ADMIN_CLERK_USER_ID) {
      return { success: false, error: 'অনুমতি নেই।' };
    }
    
    await connectDB();
    await Recipe.findByIdAndUpdate(id, { isApproved: true });
    revalidatePath('/admin');
    revalidatePath('/recipelist');
    return { success: true, error: null };
  } catch (e) {
    return { success: false, error: 'অনুমোদন করতে সমস্যা হয়েছে।' };
  }
}

export async function deleteRecipeAction(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { userId } = await auth();
    if (userId !== process.env.ADMIN_CLERK_USER_ID) {
      return { success: false, error: 'অনুমতি নেই।' };
    }
    await connectDB();
    await Recipe.findByIdAndDelete(id);
    revalidatePath('/admin');
    revalidatePath('/recipelist');
    return { success: true, error: null };
  } catch (e) {
    return { success: false, error: 'মুছে ফেলতে সমস্যা হয়েছে।' };
  }
}

export async function bulkDeleteRecipesAction(ids: string[]): Promise<{ success: boolean; error: string | null }> {
  try {
    const { userId } = await auth();
    if (userId !== process.env.ADMIN_CLERK_USER_ID) {
      return { success: false, error: 'অনুমতি নেই।' };
    }
    await connectDB();
    await Recipe.deleteMany({ _id: { $in: ids } });
    revalidatePath('/admin');
    revalidatePath('/recipelist');
    return { success: true, error: null };
  } catch (e) {
    return { success: false, error: 'মুছে ফেলতে সমস্যা হয়েছে।' };
  }
}

export async function getPendingRecipesAction(): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const { userId } = await auth();
    if (userId !== process.env.ADMIN_CLERK_USER_ID) {
      return { data: null, error: 'অনুমতি নেই।' };
    }
    
    await connectDB();
    const recipes = await Recipe.find({ isApproved: false }).sort({ createdAt: -1 });
    return { data: JSON.parse(JSON.stringify(recipes)), error: null };
  } catch (e) {
    return { data: null, error: 'পেন্ডিং রেসিপি আনতে সমস্যা হয়েছে।' };
  }
}

export async function isAdminAction(): Promise<boolean> {
  try {
    const { userId } = await auth();
    return !!userId && userId === process.env.ADMIN_CLERK_USER_ID;
  } catch (e) {
    return false;
  }
}

export async function importRecipesAction(recipes: any[]): Promise<{ success: boolean; count: number; error: string | null }> {
  try {
    const { userId } = await auth();
    if (userId !== process.env.ADMIN_CLERK_USER_ID) {
      return { success: false, count: 0, error: 'অনুমতি নেই।' };
    }
    
    await connectDB();
    
    if (!Array.isArray(recipes)) {
      return { success: false, count: 0, error: 'ভুল ডাটা ফরম্যাট।' };
    }

    const validCategories = ['বিরিয়ানি', 'মাছ', 'মাংস', 'ভর্তা', 'মিষ্টি', 'নাস্তা', 'সবজি', 'ডাল', 'ভাত/পোলাও', 'অন্যান্য'];
    
    const formattedRecipes = recipes.map(r => ({
      ...r,
      title: r.title?.trim().substring(0, 100),
      isApproved: true,
      category: validCategories.includes(r.category) ? r.category : 'অন্যান্য',
      prepTimeMinutes: parseInt(r.prepTimeMinutes) || 15,
      cookTimeMinutes: parseInt(r.cookTimeMinutes) || 30,
      totalTimeMinutes: (parseInt(r.prepTimeMinutes) || 15) + (parseInt(r.cookTimeMinutes) || 30),
      servings: parseInt(r.servings) || 4,
      tags: Array.isArray(r.tags) ? r.tags : [],
    }));

    const result = await Recipe.insertMany(formattedRecipes);
    revalidatePath('/recipelist');
    
    return { success: true, count: result.length, error: null };
  } catch (e) {
    console.error(e);
    return { success: false, count: 0, error: 'রেসিপি ইমপোর্ট করতে সমস্যা হয়েছে।' };
  }
}

export async function textToSpeechAction(text: string): Promise<{ data: { audioDataUri: string } | null; error: string | null }> {
    return { data: null, error: 'Text to speech is currently disabled.' };
}
