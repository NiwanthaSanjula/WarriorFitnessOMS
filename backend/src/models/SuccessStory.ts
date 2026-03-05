
import mongoose, { Schema, Document } from 'mongoose';
export interface ISuccessStory extends Document {
    memberName:   string;
    quote:        string;
    duration:     string;  
    beforeImage:  string; 
    afterImage:   string;
    isVisible:    boolean;
    order:        number;
    createdAt:    Date;
    updatedAt:    Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>(
    {
        memberName:  { type: String, required: true, trim: true },
        quote:       { type: String, required: true, trim: true },
        duration:    { type: String, required: true, trim: true },
        beforeImage: { type: String, required: true },
        afterImage:  { type: String, required: true },
        isVisible:   { type: Boolean, default: true },
        order:       { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model<ISuccessStory>('SuccessStory', SuccessStorySchema);