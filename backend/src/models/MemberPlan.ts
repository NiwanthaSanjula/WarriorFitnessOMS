import mongoose, { Document, Schema } from "mongoose";

export interface IMemberPlan extends Document {
    member: mongoose.Types.ObjectId;
    coach: mongoose.Types.ObjectId;
    planType: 'WorkoutPlan' | 'NutritionPlan';
    plan: mongoose.Types.ObjectId;
    status: 'active' | 'completed' | 'cancelled';
    startDate: Date;
    coachNotes?: string;
}

const memberPlanSchema = new Schema<IMemberPlan>({
    member:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coach:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planType: { 
        type: String, 
        enum: ['WorkoutPlan', 'NutritionPlan'], 
        required: true 
    },
    plan: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        refPath: 'planType'
    },
    status:     { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    startDate:  { type: Date, default: Date.now },
    coachNotes: { type: String, default: "" }
}, { timestamps: true })

memberPlanSchema.index({ member: 1, planType: 1, status: 1 });

export default mongoose.model<IMemberPlan>('MemberPlan', memberPlanSchema);