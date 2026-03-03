import mongoose, { Document, Schema } from "mongoose";

export interface IMemberPlan extends Document {
    member: mongoose.Types.ObjectId;
    coach: mongoose.Types.ObjectId;
    planType: 'workout' | 'nutrition';
    plan: mongoose.Types.ObjectId;  
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    coachNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const memberPlanSchema = new Schema<IMemberPlan>({
    member: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coach: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planType: { type: String, enum: ['workout', 'nutrition'], required: true },
    plan: { type: Schema.Types.ObjectId, required: true, refPath: 'planType' },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'cancelled'],
        default: 'active'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    coachNotes: { type: String, default: "" }
}, { timestamps: true });

// A member can only have ONE active plan of each type at a time
// Enforce this in the service layer
memberPlanSchema.index({ member: 1, planType: 1, status: 1 });

export default mongoose.model<IMemberPlan>('MemberPlan', memberPlanSchema);