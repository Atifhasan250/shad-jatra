import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInstruction {
  step: number;
  description: string;
  time_needed?: string;
  timeSeconds?: number;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  image_url: string;
  ingredients: string[];
  instructions: IInstruction[];
  category: 'বিরিয়ানি' | 'মাছ' | 'মাংস' | 'ভর্তা' | 'মিষ্টি' | 'নাস্তা' | 'সবজি' | 'ডাল';
  tags: string[];
  difficulty: 'সহজ' | 'মাঝারি' | 'কঠিন';
  totalTimeMinutes: number;
  servings: number;
  authorId?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

const InstructionSchema = new Schema<IInstruction>({
  step: { type: Number, required: true },
  description: { type: String, required: true },
  time_needed: { type: String },
  timeSeconds: { type: Number, default: 0 },
});

const RecipeSchema = new Schema<IRecipe>({
  title: { type: String, required: true, index: true },
  description: { type: String },
  image_url: { type: String },
  ingredients: [{ type: String }],
  instructions: [InstructionSchema],
  category: { 
    type: String, 
    enum: ['বিরিয়ানি', 'মাছ', 'মাংস', 'ভর্তা', 'মিষ্টি', 'নাস্তা', 'সবজি', 'ডাল', 'অন্যান্য'],
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
}, { timestamps: true });

// Add a text index on title + description + ingredients + tags for $text search
RecipeSchema.index({ title: 'text', description: 'text', ingredients: 'text', tags: 'text' });

const Recipe: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
