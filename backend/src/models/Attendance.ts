import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "./User.js";

export interface IAttendance extends Document {
    user: Types.ObjectId | IUser;
    date: Date;
    checkInTime: Date;
    status: 'present' | 'absent';
}

const attendanceSchema = new mongoose.Schema<IAttendance>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Attendance must belong to a user1']
    },
    date: {
        type: Date,
        required: true,
    },
    checkInTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present'
    }
}, { timestamps: true});

//  Ensure a user can only check in once per normalized date
attendanceSchema.index({ user: 1, date: 1}, { unique: true });

const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;