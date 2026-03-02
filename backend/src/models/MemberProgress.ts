// models/MemberProgress.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMemberProgress extends Document {
    member: mongoose.Types.ObjectId;
    coach?: mongoose.Types.ObjectId;
    weight: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
    notes?: string;
    coachNotes?: string;       
    photoUrl?: string;
    energyLevel?: number;      
    mood?: number;              
    createdAt: Date;
    updatedAt: Date;
}

const memberProgressSchema = new Schema<IMemberProgress>(
    {
        member: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        coach: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        weight: { 
            type: Number, required: true,
            min: [20, "Weight must be at least 20 KG"],
            max: [300, "Weight cannot exceed 300 KG"]
        },
        bodyFat: { type: Number, min: 0, max: 100, default: null },
        chest: { type: Number, default: null },
        waist: { type: Number, default: null },
        hips: { type: Number, default: null },
        biceps: { type: Number, default: null },
        thighs: { type: Number, default: null },
        notes: { type: String, default: "" },
        coachNotes: { type: String, default: "" },  // NEW
        photoUrl: { type: String, default: null },
        energyLevel: { type: Number, min: 1, max: 10, default: null },  // NEW
        mood: { type: Number, min: 1, max: 10, default: null },         // NEW
    },
    { timestamps: true }
);

memberProgressSchema.index({ member: 1, createdAt: -1 });
export default mongoose.model<IMemberProgress>('MemberProgress', memberProgressSchema);