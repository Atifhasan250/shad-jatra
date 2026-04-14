# স্বাদ যাত্রা — Full Upgrade Prompt for AI Agent
**Stack: Next.js 15 (App Router), MongoDB + Mongoose, Clerk Auth, Tailwind CSS, ShadCN UI, Vercel**

---

## CONTEXT

This is a Bangladeshi recipe web app called **স্বাদ যাত্রা** (Shad Jatra). The current codebase is a Firebase Studio scaffold with a static JSON recipe list, a search page, a recipe summary page, and a step-by-step cooking mode. The project is built with Next.js 15 App Router, Tailwind CSS, and ShadCN UI.

**The goal is to transform it from a static demo into a genuinely useful, production-worthy culinary companion app for Bangladeshi users.** Every problem below must be fixed in order. Do not skip any section. Do not hallucinate routes or imports — use only the patterns already established in the codebase.

---

## PROBLEM 1: Architecture — Static JSON → MongoDB Database

**Problem:** All recipes live in `bangladeshi_recipes_bangla.json` and `src/lib/bangladeshi-recipes.ts`. This means no user-contributed recipes, no updates without a redeploy, and no filtering beyond a client-side array scan.

**Fix:**

1. Install `mongoose` and `mongodb` packages.
2. Create `src/lib/db.ts` — a singleton MongoDB connection utility using `MONGODB_URI` from `.env.local`. Use the cached connection pattern to avoid creating multiple connections in serverless:

```ts
// src/lib/db.ts
import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGODB_URI!;
let cached = (global as any).mongoose || { conn: null, promise: null };
export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}
```

3. Create `src/models/Recipe.ts` — a Mongoose model with the full recipe schema:

```ts
// Fields: title (String, required, indexed), description (String), 
// image_url (String), ingredients ([String]), 
// instructions ([{ step: Number, description: String, time_needed: String }]),
// category (String, enum: ['বিরিয়ানি','মাছ','মাংস','ভর্তা','মিষ্টি','নাস্তা','সবজি','ডাল']),
// tags ([String]),
// difficulty ('সহজ' | 'মাঝারি' | 'কঠিন'),
// totalTimeMinutes (Number),
// servings (Number),
// authorId (String, optional — for user-submitted recipes),
// isApproved (Boolean, default: true),
// createdAt (Date, default: Date.now),
// viewCount (Number, default: 0)
// Add a text index on title + description + ingredients for $text search
```

4. Create a one-time **seed script** at `scripts/seed.ts` that reads `bangladeshi_recipes_bangla.json` and inserts all recipes into MongoDB, computing `totalTimeMinutes` from the `time_needed` fields and auto-categorizing recipes by title keywords (e.g., "বিরিয়ানি/পোলাও" → বিরিয়ানি, "মাছ/ইলিশ/চিংড়ি" → মাছ, "মাংস/গরু/মুরগি" → মাংস, "ভর্তা" → ভর্তা, "পিঠা/মিষ্টি/দই" → মিষ্টি). Add it to `package.json` scripts as `"seed": "tsx scripts/seed.ts"`.

5. Update `src/app/actions.ts` — replace all functions that read from the static JSON array with async functions that call MongoDB via Mongoose. All actions must call `connectDB()` at the top and use `Recipe.find(...)` / `Recipe.findById(...)`. Keep the same exported function signatures (`listAllRecipesAction`, `searchRecipesAction`, `findRecipeAction`) so no component needs to change its imports.

---

## PROBLEM 2: Authentication — No User System

**Problem:** The app has no user accounts. There is no way to save favourites, submit a recipe, or track recently viewed.

**Fix:**

1. Install and configure **Clerk** for Next.js (`@clerk/nextjs`). Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`.
2. Wrap the root layout (`src/app/layout.tsx`) with `<ClerkProvider>`.
3. Add `middleware.ts` at the project root to protect only the routes that require auth (`/submit-recipe`, `/profile`, `/favourites`). Public routes (home, recipe list, cooking mode) must remain accessible without login.
4. Update `src/app/layout.tsx` header: replace the existing nav with a nav that includes:
   - Logo (left)
   - "তালিকা" link (middle)
   - Clerk's `<UserButton />` (right, shows avatar + dropdown when signed in)
   - "লগইন করুন" `<SignInButton>` when signed out
5. Create `src/models/User.ts` Mongoose model to mirror Clerk user data and store app-specific data: `{ clerkId: String (unique, indexed), favouriteRecipeIds: [String], recentlyViewedIds: [String], createdAt: Date }`.

---

## PROBLEM 3: Search — Basic String Match, No Filtering

**Problem:** `searchRecipesAction` does a simple `.filter()` on an in-memory array. There is no category filter, difficulty filter, or ingredient-based search.

**Fix:**

1. Update `searchRecipesAction` to use MongoDB `$text` search when a query string is provided, falling back to `Recipe.find({})` for empty queries.
2. Add a new server action `filterRecipesAction(filters: { category?: string, difficulty?: string, query?: string })` that builds a dynamic MongoDB query combining `$text`, `category`, and `difficulty` filters.
3. Update `src/app/recipelist/page.tsx`:
   - Add a row of **category filter chips** below the search bar (বিরিয়ানি, মাছ, মাংস, ভর্তা, মিষ্টি, নাস্তা, সবজি, ডাল, সব). Clicking a chip filters the list.
   - Add a "কঠিনতা" dropdown (সহজ / মাঝারি / কঠিন / সব).
   - All filters combine — a user can search "মাছ" AND filter by category "সহজ" simultaneously.
   - Show a result count: `"X টি রেসিপি পাওয়া গেছে"`.
   - Add skeleton loading cards (use ShadCN `Skeleton`) while fetching instead of a spinner.

---

## PROBLEM 4: Recipe Detail Page — No Dedicated URL

**Problem:** Recipes don't have their own URLs. Clicking a recipe in the list pushes `/?recipe=কাচ্চি বিরিয়ানি` and triggers a search on the homepage. This breaks direct linking, sharing, and browser history.

**Fix:**

1. Create `src/app/recipe/[id]/page.tsx` — a proper dynamic route for each recipe. This page must:
   - Be a **Server Component** that fetches the recipe from MongoDB by `id` using `params.id`.
   - Call `Recipe.findByIdAndUpdate(id, { $inc: { viewCount: 1 } })` to increment view count on every load.
   - Export `generateMetadata({ params })` that returns dynamic `<title>` and `<description>` using the recipe's title and description — critical for SEO.
   - Render the full recipe: title, description, ingredient list, and an embedded `<CookingView>` client component.
   - Include structured data (`application/ld+json`) with `Recipe` schema markup for Google.

2. Update `src/app/recipelist/page.tsx`: change `handleRecipeSelect` to navigate to `/recipe/${recipe.id}` instead of `/?recipe=...`.

3. Update `src/components/HomePageClient.tsx`: remove the `useSearchParams` + `handleSearch` logic that was loading recipes from URL query params. The home page should just show the search box. When a user submits a search, navigate them to `/recipelist?q=<query>` instead of running `findRecipeAction` inline.

4. Update `src/app/recipelist/page.tsx` to read an initial `q` search param from the URL (`useSearchParams`) and pre-populate the search field and results on load.

---

## PROBLEM 5: Recipe Cards — Missing Image, Sparse Info

**Problem:** Recipe cards in `/recipelist` show only the title, ingredient count, and 3 ingredients. The `image_url` in the JSON points to `example.com` placeholder URLs. Cards are not visually engaging.

**Fix:**

1. **Images:** For each recipe in the seed script, fetch a real food image from the **Unsplash Source API** (`https://source.unsplash.com/featured/?{englishFoodKeyword}`) or use a curated set of Bangladeshi food images from a public CDN. Store the real image URL in the MongoDB document. Alternatively, generate a visually distinct **color-coded placeholder** using the recipe's category (e.g., each category has a unique gradient background + emoji, no broken image links).

2. **Recipe Card redesign** (`src/app/recipelist/page.tsx`): Each card must show:
   - A **hero image** (or category-colored gradient with emoji) at the top (aspect-ratio 16/9).
   - Recipe title (bold, Bengali font).
   - Category badge (colored pill).
   - Difficulty badge.
   - Total time (with clock icon).
   - Ingredient count.
   - A "রান্না করুন →" button that links to `/recipe/[id]`.
   - On hover: a subtle scale transform and border highlight.

3. Use CSS `aspect-ratio: 16/9` and `object-fit: cover` for images. Add `loading="lazy"` to all recipe card images.

---

## PROBLEM 6: Cooking Mode — Timer is Fragile, No Persistence

**Problem:** `CookingView.tsx` uses a regex (`TIME_REGEX`) to extract times from Bengali instruction text. This fails on most instructions because times are embedded mid-sentence and the regex is brittle. The cooking mode also loses progress if the user refreshes the page.

**Fix:**

1. **Structured timers:** When seeding MongoDB (Problem 1), parse `time_needed` from the instruction objects (it already exists as a separate field in the JSON, e.g., `"time_needed": "১০ মিনিট"`). Store `timeSeconds` as a computed integer field on each instruction object in MongoDB. This eliminates the need for runtime regex parsing.

2. Update `CookingView.tsx`:
   - Remove `TIME_REGEX` entirely.
   - Instead, receive `instructions` as `{ description: string, timeSeconds?: number }[]`.
   - Show the timer only when `timeSeconds > 0`.

3. **Progress persistence:** Use `localStorage` to save `{ recipeId, currentStep }` when the user navigates between steps. On mount, check localStorage for a saved position for the current recipe and resume from there. Clear the saved position when the user finishes (`onFinish`).

4. **Sound alert:** When a timer hits 0, play a short beep using the Web Audio API (`AudioContext` + `OscillatorNode`). No external audio files needed. Add a toggle button to mute/unmute.

5. **Ingredient checklist:** Add a sidebar (or expandable panel on mobile) in `CookingView` that lists all ingredients with checkboxes. Users can check off ingredients as they use them. State is kept in `useState` — no backend needed.

---

## PROBLEM 7: Favourites Feature — Does Not Exist

**Problem:** There is no way for a user to save a recipe for later.

**Fix:**

1. Add server actions in `src/app/actions.ts`:
   - `toggleFavouriteAction(recipeId: string)` — requires auth (check Clerk session). Adds or removes the recipe ID from the user's `favouriteRecipeIds` array in MongoDB.
   - `getFavouritesAction()` — returns the list of favourite recipe summaries for the logged-in user.
   - `isFavouriteAction(recipeId: string)` — returns a boolean.

2. Add a **heart icon button** to every recipe card and the recipe detail page header. It must:
   - Be filled/red when the recipe is a favourite, outline when not.
   - Trigger `toggleFavouriteAction` on click.
   - Show a toast confirmation ("প্রিয়তে যোগ হয়েছে ❤️" / "সরানো হয়েছে").
   - If the user is not logged in, clicking the heart redirects to Clerk's sign-in flow.

3. Create `src/app/favourites/page.tsx` — a page that shows the logged-in user's favourite recipes in the same card grid as `/recipelist`. Protected by middleware (redirects to sign-in if not authenticated). Add a "প্রিয় রেসিপি" link to the header nav (only shown when signed in).

---

## PROBLEM 8: User Recipe Submission — Does Not Exist

**Problem:** All content is static. Users cannot contribute their own recipes.

**Fix:**

1. Create `src/app/submit-recipe/page.tsx` — a protected page (middleware blocks unauthenticated users). The form must collect:
   - Title (text input, required)
   - Description (textarea, required)
   - Category (select from the 8 categories)
   - Difficulty (select: সহজ / মাঝারি / কঠিন)
   - Total time in minutes (number input)
   - Servings (number input)
   - Ingredients (dynamic list — user clicks "+ উপকরণ যোগ করুন" to add a new ingredient text field, and a trash icon to remove one)
   - Instructions (dynamic list — same add/remove pattern, each item is a textarea + optional time input in minutes)
   - Image URL (optional text input with live preview)

2. Use `react-hook-form` + `zod` for validation (both are already in `package.json`).

3. Add a server action `submitRecipeAction(data)` that:
   - Validates with Zod.
   - Sets `isApproved: false` and `authorId: clerkUserId` on the new MongoDB document.
   - Returns success/error.

4. On success, show a toast: "আপনার রেসিপি জমা হয়েছে! অনুমোদনের পর প্রকাশিত হবে।" and redirect to the home page.

5. **Admin approval route:** Create `src/app/admin/page.tsx` (protect with a hardcoded `ADMIN_CLERK_USER_ID` env check — if the logged-in Clerk user ID doesn't match, return a 403). This page lists all `isApproved: false` recipes with "অনুমোদন করুন" and "বাতিল করুন" buttons. Clicking approve sets `isApproved: true`.

---

## PROBLEM 9: Home Page — Generic, No Discovery

**Problem:** The home page is just a search box. Users with no specific recipe in mind have nothing to do. There is no discovery mechanism.

**Fix:**

Redesign `src/components/HomePageClient.tsx` to be a proper landing page with these sections:

1. **Hero section:** Large headline ("আজ কী রান্না করবেন?"), subheading, and the search box. Behind the hero, add a subtle animated background — a slow-moving gradient mesh using CSS `@keyframes` in `globals.css`.

2. **Category quick-links:** A horizontal scroll row of category cards (emoji + label). Clicking any takes the user to `/recipelist?category=মাছ` etc.

3. **Featured recipes:** A "বিশেষ রেসিপি" section — a horizontal scroll row of 5–6 recipe cards fetched from MongoDB sorted by `viewCount` descending. These are the most-viewed recipes. Fetch this server-side in a Server Component wrapper and pass as props to the client component.

4. **Recently viewed:** If the user has viewed any recipes (tracked in localStorage as an array of recipe IDs), show a "সম্প্রতি দেখা" section with up to 4 cards. Fetch the recipe summaries from MongoDB based on those IDs.

5. Remove the `appState` machine from `HomePageClient` entirely — the home page no longer handles recipe lookup inline. Recipe search goes to `/recipelist`, recipe viewing goes to `/recipe/[id]`. The home page is a pure discovery/navigation page.

---

## PROBLEM 10: Design System — Mediocre Visuals

**Problem:** The current design uses Inter + generic ShadCN defaults with a green primary color. It looks like an unfinished template.

**Fix — complete design overhaul:**

### Typography
- Change the body font from `Inter` to **`Hind Siliguri`** (Google Fonts) — this font renders Bengali script beautifully alongside Latin characters.
- Change the headline font from `Poppins` to **`Baloo Da 2`** — a Bengali-Latin display font with great personality.
- Update `src/app/layout.tsx` font imports and `tailwind.config.ts` font family definitions.

### Color Palette
Replace the current palette with a warm, food-inspired palette:

```css
/* In src/app/globals.css — both light and dark modes */

/* Light mode */
--background: 35 33% 97%;          /* warm off-white, like aged parchment */
--foreground: 20 25% 12%;          /* deep warm brown */
--card: 35 33% 97%;
--card-foreground: 20 25% 12%;
--primary: 22 90% 52%;             /* rich saffron/turmeric orange */
--primary-foreground: 0 0% 100%;
--secondary: 155 40% 42%;          /* mustard green (like shorshe/mustard) */
--secondary-foreground: 0 0% 100%;
--accent: 340 70% 52%;             /* deep red (like red chilli) */
--accent-foreground: 0 0% 100%;
--muted: 35 20% 90%;
--muted-foreground: 20 15% 45%;
--border: 35 20% 84%;

/* Dark mode */
--background: 20 18% 8%;           /* very dark warm brown */
--foreground: 35 25% 90%;          /* cream */
--card: 20 18% 11%;
--card-foreground: 35 25% 90%;
--primary: 22 90% 58%;             /* same saffron, slightly brighter */
--primary-foreground: 20 18% 8%;
--secondary: 155 40% 48%;
--secondary-foreground: 20 18% 8%;
--accent: 340 70% 58%;
--accent-foreground: 0 0% 100%;
--muted: 20 12% 18%;
--muted-foreground: 35 15% 55%;
--border: 20 12% 20%;
```

### Logo
Update `src/components/Logo.tsx`: replace the `ChefHat` lucide icon with a custom SVG of a **patil (clay pot)** silhouette, or use the 🫕 or 🍲 emoji styled at `text-3xl` with a `drop-shadow`. The wordmark "স্বাদ যাত্রা" should use the `Baloo Da 2` headline font.

### Header
Update `src/app/layout.tsx` header:
- Background: `bg-background/80 backdrop-blur-md` with a `1px` bottom border.
- Add a subtle horizontal animated gradient underline under the logo on hover.
- Nav links get an underline slide-in animation on hover.

### Recipe Cards
- Background: `bg-card` with a `1px` border that shifts to `primary` color on hover.
- Add `transition-all duration-200` and `hover:shadow-lg hover:-translate-y-1` for lift effect.
- Category badges: each category gets its own background color (use a `categoryColors` map object in a shared utility file).
- Difficulty badge: "সহজ" = green, "মাঝারি" = yellow, "কঠিন" = red.

### Cooking Mode
- Full-screen takeover with a dark overlay background.
- Current step text: `text-3xl` centered, with smooth `animate-in fade-in slide-in-from-bottom` transition when the step changes.
- Timer: large, monospace, glowing amber ring using `box-shadow: 0 0 24px hsl(var(--primary))`.
- Progress bar: uses `primary` color with a smooth CSS transition.

---

## PROBLEM 11: Performance — No Caching, No Optimisation

**Problem:** Every page load hits MongoDB directly. Recipe images are from `example.com`. No metadata for SEO. No loading states beyond a spinner.

**Fix:**

1. **Next.js caching:** In the Server Component recipe list and recipe detail fetches, use `unstable_cache` from `next/cache` or tag-based revalidation. Set `revalidate: 3600` (1 hour) for the recipe list. Set `revalidate: 86400` (1 day) for individual recipe pages. Revalidate on admin approval using `revalidatePath('/recipelist')`.

2. **next/image:** Replace all `<img>` tags with Next.js `<Image>` from `next/image`. Add the image hostnames to `next.config.ts` under `images.remotePatterns`. Use `placeholder="blur"` with a `blurDataURL` generated at seed time (or a static low-res base64 blur placeholder).

3. **Skeleton loaders:** Replace all spinner-only loading states with ShadCN `Skeleton` components that mimic the card layout. Create `src/components/RecipeCardSkeleton.tsx` — a card-shaped skeleton that renders during `loading.tsx` suspense boundaries.

4. **loading.tsx files:** Add `src/app/recipelist/loading.tsx` and `src/app/recipe/[id]/loading.tsx` that render a grid of `<RecipeCardSkeleton>` components. Next.js App Router automatically shows these during navigation.

5. **SEO:** Ensure every page has a complete `generateMetadata()` export. The recipe detail page must produce:
   - `title: "${recipe.title} — রেসিপি | স্বাদ যাত্রা"`
   - `description`: recipe description truncated to 155 chars
   - `openGraph.images`: recipe image URL
   - `robots: { index: true, follow: true }`

---

## PROBLEM 12: Mobile UX — Cooking Mode is Unusable on Small Screens

**Problem:** `CookingView.tsx` uses large text and fixed card sizing that breaks on mobile. Timer and navigation buttons are too small to tap accurately.

**Fix:**

1. In `CookingView.tsx`, add `min-h-[calc(100dvh-80px)]` to the outer wrapper so it fills the actual viewport height (using dynamic viewport height to avoid the iOS browser chrome issue).

2. Navigation buttons ("পূর্ববর্তী" / "পরবর্তী"): use `size="lg"` with `min-w-[120px] min-h-[56px]` and `text-lg`. Place them fixed at the bottom on mobile using `sm:relative fixed bottom-0 left-0 right-0 bg-background border-t p-4` for the footer — this creates an iOS-app-like bottom action bar on mobile.

3. Step text: use `text-xl md:text-3xl lg:text-4xl` for responsive sizing.

4. Timer display: use `text-4xl md:text-6xl` and center it in a round pill with generous padding.

5. Add swipe gesture support: use `onTouchStart` / `onTouchEnd` to detect left/right swipes and call `handleNext` / `handlePrev`. A swipe of more than 80px horizontal distance triggers navigation.

---

## PROBLEM 13: Error Handling — No Boundary, Silent Failures

**Problem:** If MongoDB is unreachable, the app shows the generic Next.js error page. Server actions return `{ data: null, error: string }` but some components don't handle the error case visually.

**Fix:**

1. Add `src/app/error.tsx` — a root error boundary that catches unexpected errors and shows a friendly Bengali message with a "পুনরায় চেষ্টা করুন" (`reset()`) button.

2. Add `src/app/recipe/[id]/not-found.tsx` — shown when a recipe ID doesn't exist in MongoDB. Display a "রেসিপি খুঁজে পাওয়া যায়নি" message with a link back to the recipe list.

3. In `src/app/recipe/[id]/page.tsx`, call Next.js `notFound()` if `Recipe.findById(params.id)` returns null.

4. Wrap every server action's MongoDB call in a `try/catch`. Log the error server-side (`console.error`). Return `{ data: null, error: 'একটি সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।' }` for all unexpected errors.

---

## PROBLEM 14: Theme Toggle — Broken Persistence

**Problem:** `ThemeToggle.tsx` toggles a `dark` class on `document.documentElement` but does not persist to `localStorage`. On page refresh, the theme always resets to dark (hardcoded `className="dark"` on `<html>`).

**Fix:**

1. Replace the custom `ThemeToggle.tsx` with `next-themes` library (`npm install next-themes`).
2. Wrap `src/app/layout.tsx` body content with `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>` from `next-themes`.
3. Remove the hardcoded `className="dark"` from the `<html>` tag — let `next-themes` manage it.
4. Update `ThemeToggle.tsx` to use `useTheme()` hook from `next-themes`. This handles SSR hydration correctly and persists the user's preference to `localStorage` automatically.

---

## PROBLEM 15: Missing `.env.local` Template

**Problem:** There is no `.env.example` or `.env.local.example` file. A developer cloning the repo has no idea what environment variables are required.

**Fix:**

Create `.env.local.example` at the project root:

```
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Admin
ADMIN_CLERK_USER_ID=user_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

Add `.env.local.example` to `.gitignore` exclusion exemption (it should be committed — it has no real secrets).

---

## EXECUTION ORDER FOR THE AI AGENT

Execute in this exact order to avoid broken imports:

1. Install all new packages: `mongoose`, `@clerk/nextjs`, `next-themes`
2. Create `.env.local.example`
3. Create `src/lib/db.ts`
4. Create `src/models/Recipe.ts`
5. Create `src/models/User.ts`
6. Create `scripts/seed.ts` and run it
7. Update `src/app/actions.ts` (replace static JSON with MongoDB calls)
8. Update `src/app/globals.css` (new color palette)
9. Update `src/app/layout.tsx` (fonts + Clerk + next-themes)
10. Update `tailwind.config.ts` (new fonts)
11. Update `src/components/Logo.tsx`
12. Update `src/components/ThemeToggle.tsx`
13. Create `src/app/recipe/[id]/page.tsx`
14. Create `src/app/recipe/[id]/not-found.tsx`
15. Update `src/app/recipelist/page.tsx` (filters + skeleton + new card design + new navigation)
16. Create `src/app/recipelist/loading.tsx`
17. Update `src/components/HomePageClient.tsx` (discovery page)
18. Update `src/components/CookingView.tsx` (structured timers + localStorage + swipe + sound)
19. Create `src/app/favourites/page.tsx`
20. Create `src/app/submit-recipe/page.tsx`
21. Create `src/app/admin/page.tsx`
22. Create `src/app/error.tsx`
23. Update `middleware.ts` (Clerk route protection)
24. Update `next.config.ts` (image domains + caching)
25. Create `src/components/RecipeCardSkeleton.tsx`

---

## DO NOT CHANGE

- Keep `src/lib/utils.ts` (`cn`) unchanged.
- Keep all ShadCN UI component files in `src/components/ui/` unchanged.
- Keep `src/hooks/use-toast.ts` and `src/hooks/use-mobile.tsx` unchanged.
- Keep `vercel.json` unchanged.
- Keep `next.config.ts` `typescript.ignoreBuildErrors: true` — do not remove it.
- The dev server port remains `9002`.

---

## FINAL CHECKLIST (agent must verify before finishing)

- [ ] `npm run dev` starts without errors on port 9002
- [ ] `npm run build` completes without errors
- [ ] MongoDB connection works (test with a console.log in `connectDB`)
- [ ] Seed script populates at least 20 recipes
- [ ] `/recipelist` shows a grid of recipe cards with images/gradients
- [ ] `/recipe/[id]` loads a recipe, increments viewCount, has correct meta tags
- [ ] Cooking mode timer works for recipes with `time_needed` data
- [ ] Theme toggle persists across page refresh
- [ ] Clerk sign-in redirects to `/` after success
- [ ] Favourites page works for signed-in users
- [ ] Recipe submission form validates and saves to MongoDB with `isApproved: false`
- [ ] Admin page shows unapproved recipes and can approve them
- [ ] Mobile view of cooking mode has fixed bottom navigation bar
- [ ] No `example.com` image URLs appear in the UI
