import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

// Define Schema locally in the script to avoid TS issues with imports during direct execution
const InstructionSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  description: { type: String, required: true },
  time_needed: { type: String },
  timeSeconds: { type: Number, default: 0 },
});

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String },
  image_url: { type: String },
  ingredients: [{ type: String }],
  instructions: [InstructionSchema],
  category: { 
    type: String, 
    enum: ['বিরিয়ানি', 'মাছ', 'মাংস', 'ভর্তা', 'মিষ্টি', 'নাস্তা', 'সবজি', 'ডাল'],
    required: true,
    index: true 
  },
  tags: [{ type: String }],
  difficulty: { 
    type: String, 
    enum: ['সহজ', 'মাঝারি', 'কঠিন'],
    default: 'মাঝারি'
  },
  totalTimeMinutes: { type: Number, default: 0 },
  servings: { type: Number, default: 4 },
  authorId: { type: String, index: true },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 0 },
});

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'বিরিয়ানি': ['বিরিয়ানি', 'পোলাও', 'তেহারি', 'খিচুড়ি'],
  'মাছ': ['মাছ', 'ইলিশ', 'চিংড়ি', 'রুই', 'পাঙ্গাশ', 'পাবদা', 'বোয়াল'],
  'মাংস': ['মাংস', 'গরু', 'মুরগি', 'খাসি', 'কাবাব', ' রেজালা', 'কোর্মা'],
  'ভর্তা': ['ভর্তা', 'শুঁটকি'],
  'মিষ্টি': ['পিঠা', 'মিষ্টি', 'দই', 'হালুয়া', 'ক্ষীর', 'পায়েস'],
  'নাস্তা': ['নাস্তা', 'পিঠা', 'চপ', 'শিঙাড়া', 'সমুচা', 'পুরি'],
  'সবজি': ['সবজি', 'ভাজি', 'তরকারি', 'শাক'],
  'ডাল': ['ডাল', 'ডালনা'],
};

const TITLE_TO_ENGLISH: Record<string, string> = {
  'বিরিয়ানি': 'biryani',
  'মাছ': 'fish',
  'মাংস': 'meat',
  'ভর্তা': 'mashed',
  'মিষ্টি': 'sweet',
  'নাস্তা': 'snack',
  'সবজি': 'vegetable',
  'ডাল': 'lentil',
};

function autoCategorize(title: string): string {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => title.includes(keyword))) {
      return category;
    }
  }
  return 'সবজি'; // Default
}

function parseTimeSeconds(timeStr?: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)\s*মিনিট/);
  if (match) {
    return parseInt(match[1], 10) * 60;
  }
  return 0;
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    const filePath = path.join(process.cwd(), 'bangladeshi_recipes_bangla.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const recipes = JSON.parse(rawData);

    console.log(`Found ${recipes.length} recipes in JSON.`);

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('Cleared existing recipes.');

    const formattedRecipes = recipes.map((recipe: any) => {
      const category = autoCategorize(recipe.title);
      const englishKeyword = TITLE_TO_ENGLISH[category] || 'food';
      
      const instructions = recipe.instructions.map((inst: any, idx: number) => {
        const desc = typeof inst === 'string' ? inst : inst.description;
        const time_needed = typeof inst === 'string' ? '' : inst.time_needed;
        return {
          step: idx + 1,
          description: desc,
          time_needed: time_needed,
          timeSeconds: parseTimeSeconds(time_needed),
        };
      });

      const totalTimeMinutes = instructions.reduce((acc: number, curr: any) => acc + (curr.timeSeconds / 60), 0);

      const CATEGORY_COLORS: Record<string, string> = {
        'বিরিয়ানি': 'D4A017',
        'মাছ': '1E90FF',
        'মাংস': 'B22222',
        'ভর্তা': '6B8E23',
        'মিষ্টি': 'DB7093',
        'নাস্তা': 'DAA520',
        'সবজি': '228B22',
        'ডাল': 'CD853F',
      };
      const bgColor = CATEGORY_COLORS[category] || 'E8A317';
      
      return {
        title: recipe.title,
        description: recipe.description || `সুস্বাদু ${recipe.title} তৈরির সহজ রেসিপি।`,
        image_url: `https://placehold.co/600x400/${bgColor}/FFFFFF?text=${encodeURIComponent(recipe.title.substring(0, 20))}`,
        ingredients: recipe.ingredients,
        instructions: instructions,
        category: category,
        difficulty: recipe.difficulty || 'মাঝারি',
        totalTimeMinutes: Math.round(totalTimeMinutes) || 30,
        servings: 4,
        isApproved: true,
        viewCount: Math.floor(Math.random() * 100), // Random view count for discovery
      };
    });

    await Recipe.insertMany(formattedRecipes);
    console.log('Successfully seeded database with recipes!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
