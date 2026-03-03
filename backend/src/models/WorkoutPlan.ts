import mongoose, { Document, Schema } from "mongoose";

export interface IExerciseEntry {
    exerciseName: string;
    sets?: number;
    reps?: string;       // "8-12" or "to failure"
    duration?: string;   // "30 sec" for timed exercises
    restSeconds?: number;
    notes?: string;
}

export interface IWorkoutDay {
    dayLabel: string;    // "Day 1", "Monday", "Push Day"
    focus?: string;      // "Chest & Triceps", "Cardio"
    exercises: IExerciseEntry[];
}

export interface IWorkoutPlan extends Document {
    title: string;
    description?: string;
    coach: mongoose.Types.ObjectId;
    durationWeeks: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    goal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_fitness';
    daysPerWeek: number;
    schedule: IWorkoutDay[];
    isTemplate: boolean;   // true = reusable template, false = custom for one member
    createdAt: Date;
    updatedAt: Date;
}

const exerciseEntrySchema = new Schema<IExerciseEntry>({
    exerciseName: { type: String, required: true },
    sets: { type: Number, default: null },
    reps: { type: String, default: null },
    duration: { type: String, default: null },
    restSeconds: { type: Number, default: null },
    notes: { type: String, default: "" }
}, { _id: false });

const workoutDaySchema = new Schema<IWorkoutDay>({
    dayLabel: { type: String, required: true },
    focus: { type: String, default: "" },
    exercises: [exerciseEntrySchema]
}, { _id: false });

const workoutPlanSchema = new Schema<IWorkoutPlan>({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coach: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    durationWeeks: { type: Number, required: true, min: 1, max: 52 },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    goal: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'endurance', 'general_fitness'],
        required: true
    },
    daysPerWeek: { type: Number, required: true, min: 1, max: 7 },
    schedule: [workoutDaySchema],
    isTemplate: { type: Boolean, default: true }
}, { timestamps: true });

workoutPlanSchema.index({ coach: 1, createdAt: -1 });

export default mongoose.model<IWorkoutPlan>('WorkoutPlan', workoutPlanSchema);