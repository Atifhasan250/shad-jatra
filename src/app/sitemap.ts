import { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db'
import Recipe from '@/models/Recipe'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shad-jatra.vercel.app'
  
  // Static routes
  const routes = [
    '',
    '/recipelist',
    '/submit-recipe',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    await connectDB()
    // Fetch only approved recipes for the sitemap
    const recipes = await Recipe.find({ isApproved: true })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .limit(500)
    
    const recipeRoutes = recipes.map((recipe) => ({
      url: `${baseUrl}/recipe/${recipe._id}`,
      lastModified: recipe.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...routes, ...recipeRoutes] as MetadataRoute.Sitemap
  } catch (e) {
    console.error('Sitemap generation error:', e)
    return routes as MetadataRoute.Sitemap
  }
}
