import jwt from 'jsonwebtoken';
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

// ── QR Code Functions ────────────────────────────────────────────────────────

/**
 * Generates a short-lived JWT (5 minutes) for a member to use as their QR code.
 * The token encodes { userId, purpose: 'qr-attendance' }.
 */
export const generateQRToken = (userId: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    return jwt.sign(
        { userId, purpose: 'qr-attendance' },
        secret,
        { expiresIn: '5m' }
    );
};

/**
 * Verifies a QR token, extracts the userId, and records attendance.
 * Throws if the token is invalid/expired or if already checked in today.
 */
export const verifyQRAndCheckIn = async (token: string): Promise<{ attendance: IAttendance; userId: string }> => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    let payload: any;
    try {
        payload = jwt.verify(token, secret);
    } catch {
        throw new Error('QR code is invalid or has expired. Please refresh your QR code.');
    }

    if (payload.purpose !== 'qr-attendance') {
        throw new Error('Invalid QR code type.');
    }

    const attendance = await createAttendanceRecord(payload.userId);
    return { attendance, userId: payload.userId };
};