import mongoose, { Schema } from "mongoose";

export interface ICoachProfile extends Document {
    user: mongoose.Types.ObjectId;
    specialties: string[];
    bio: string;
    certifications: string[];
    experienceYears: number;
    rating: number;
}

const coachProfileSchema = new Schema<ICoachProfile>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialties: [{type: String}],
    bio: { type: String, default: "Proffesional Warrior Fitness Coach" },
    certifications: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 }
},{ timestamps: true});

export default mongoose.model<ICoachProfile>('CoachProfile', coachProfileSchema);