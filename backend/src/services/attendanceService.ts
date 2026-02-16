import Attendance, { IAttendance } from "../models/Attendance.js";

export const createAttendanceRecord =  async ( userId: string): Promise<IAttendance> =>  {

    //  Normalize today's date
    const today = new Date();
    today.setHours(0,0,0,0);

    //  Create a attendance record
    //  The unique index in model { user:1 , date: 1 } will block duplicated automatically
    return await Attendance.create({
        user: userId,
        date: today
    });
}

export const getMemberAttendanceHistory = async (userId: string) => {
    const now = new Date();

    // Get start off the current month
    //const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    return await Attendance.find({
        user: userId,
        date: { $gte : startOfYear, $lte: endOfYear  } 
    }).select('date status').sort({ date : 1 });
}