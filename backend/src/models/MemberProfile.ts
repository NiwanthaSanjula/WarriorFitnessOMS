import mongoose, { Document, Schema } from "mongoose";

export interface IMemberProfile extends Document {
    user: mongoose.Types.ObjectId;
    medicalConditions: string[];
    fitnessGoal: string[];
    weight: number;
    height: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
}

const memberProfileShema = new Schema<IMemberProfile>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    medicalConditions: [String],
    fitnessGoal: [String],
    weight: Number,
    height: Number,
    emergencyContactName: String,
    emergencyContactPhone: String,
    emergencyContactRelation: String

}, { timestamps : true})

export default mongoose.model<IMemberProfile>('MemberProfile', memberProfileShema);