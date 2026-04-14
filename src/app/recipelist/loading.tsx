import { RecipeCardSkeleton } from "@/components/RecipeCardSkeleton"

export default function RecipeListLoading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      <div className="space-y-4 mb-10 text-center max-w-3xl mx-auto">
        <div className="h-12 bg-muted rounded-xl w-3/4 mx-auto mb-4" />
        <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto" />
      </div>
      
      <div className="h-14 bg-muted rounded-2xl mb-8 max-w-5xl mx-auto" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}
