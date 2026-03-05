import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
    title:       string;
    description: string;
    year:        string; 
    image:       string;  
    isVisible:   boolean;
    order:       number;
    createdAt:   Date;
    updatedAt:   Date;
}

const MilestoneSchema = new Schema<IMilestone>(
    {
        title:       { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        year:        { type: String, required: true, trim: true },
        image:       { type: String, required: true },
        isVisible:   { type: Boolean, default: true },
        order:       { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model<IMilestone>('Milestone', MilestoneSchema);