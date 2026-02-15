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