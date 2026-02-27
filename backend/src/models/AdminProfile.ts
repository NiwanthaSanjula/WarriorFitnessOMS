import mongoose, { Schema } from "mongoose";

const adminProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    department: { type: String, default: "Operations"},
    accessLevel: { type: Number, default: 1 }
}, { timestamps: true })

export default mongoose.model('AdminProfile', adminProfileSchema);