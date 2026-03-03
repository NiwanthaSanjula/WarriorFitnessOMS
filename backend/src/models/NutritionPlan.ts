import mongoose, { Document, Schema } from "mongoose";

export interface IMealItem {
    name: string;
    quantity?: string;    // "200g", "1 cup"
    calories?: number;
    protein?: number;     // grams
    carbs?: number;
    fats?: number;
    notes?: string;
}

export interface IMeal {
    mealName: string;     // "Breakfast", "Pre-Workout", "Lunch"
    time?: string;        // "7:00 AM"
    items: IMealItem[];
}

export interface INutritionDay {
    dayLabel: string;
    meals: IMeal[];
}

export interface INutritionPlan extends Document {
    title: string;
    description?: string;
    coach: mongoose.Types.ObjectId;
    goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general_health';
    dailyCalorieTarget?: number;
    dailyProteinTarget?: number;
    dailyCarbTarget?: number;
    dailyFatTarget?: number;
    durationWeeks: number;
    schedule: INutritionDay[];  // can be 1 day (repeated) or 7 days (varied)
    restrictions?: string[];    // ["gluten_free", "vegetarian", "dairy_free"]
    isTemplate: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const mealItemSchema = new Schema<IMealItem>({
    name: { type: String, default: "" },
    quantity: { type: String, default: "" },
    calories: { type: Number, default: null },
    protein: { type: Number, default: null },
    carbs: { type: Number, default: null },
    fats: { type: Number, default: null },
    notes: { type: String, default: "" }
}, { _id: false });

const mealSchema = new Schema<IMeal>({
    mealName: { type: String, default: "" },
    time: { type: String, default: "" },
    items: [mealItemSchema]
}, { _id: false });

const nutritionDaySchema = new Schema<INutritionDay>({
    dayLabel: { type: String, required: true },
    meals: [mealSchema]
}, { _id: false });

const nutritionPlanSchema = new Schema<INutritionPlan>({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coach: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goal: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'maintenance', 'general_health'],
        required: true
    },
    dailyCalorieTarget: { type: Number, default: null },
    dailyProteinTarget: { type: Number, default: null },
    dailyCarbTarget: { type: Number, default: null },
    dailyFatTarget: { type: Number, default: null },
    durationWeeks: { type: Number, required: true, min: 1 },
    schedule: [nutritionDaySchema],
    restrictions: [{ type: String }],
    isTemplate: { type: Boolean, default: true }
}, { timestamps: true });

nutritionPlanSchema.index({ coach: 1, createdAt: -1 });

export default mongoose.model<INutritionPlan>('NutritionPlan', nutritionPlanSchema);