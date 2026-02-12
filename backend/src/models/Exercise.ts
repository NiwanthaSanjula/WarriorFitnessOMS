import mongoose, { Schema, Document } from "mongoose";


export interface IExercise extends Document {
    name: string;
    category: 'strength' | 'cardio' | 'flexibility';
    targetMuscle: string;
    equipment: string;
    instructions?: string,
    imageUrl?: string
}

const exerciseSchema = new Schema<IExercise>({
    name: { type: String, required: true, unique: true, trim: true},
    category: {
        type: String,
        enum: ['strength', 'cardio', 'flexibility'],
        default: 'strength'
    },
    targetMuscle: { type: String, required: true },
    equipment: { type: String, default: 'none'},
    instructions: { type: String},
    imageUrl:{ type: String}
    
}, { timestamps: true});

export default mongoose.model<IExercise>('Exercise', exerciseSchema);

