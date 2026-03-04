import Attendance from "../models/Attendance.js";
import MemberProgress from "../models/MemberProgress.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";



export const getAdminStats = async () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sevendaysAgo = new Date();
    sevendaysAgo.setDate(today.getDate() - 7)

    //  Total Revenue (Last 30 Days)
    const revenueStats = await Payment.aggregate([
        { $match : { createdAt: { $gte: thirtyDaysAgo } }},
        { $group : { _id: null, total: { $sum: "$amount" } } }
    ]);

     //  Member Distribution by status (for pie chart)
     const statusStats = await User.aggregate([
        { $match: { role: 'member' } },
        { $group: {_id: "$status", count: { $sum: 1 }} }
    ]);

     //  Monthly Revenue Growth (for line chart)
     const monthlyRevenue = await Payment.aggregate([
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: {$year: "$createdAt" }},
                total: { $sum: "$amount"}
            }
        },
        { $sort: {"_id.year": 1, "_id.month": 1 } },
        {$limit: 12}
    ]);

    // Coach Workload (Doughnut Chart)
    const coachStats = await User.aggregate([
        { $match: {role: 'member', coach : {$ne : null}}},

        {
            $lookup : {
                from: 'users',
                localField: 'coach',
                foreignField: '_id',
                as: 'coachInfo'
            }
        },
        { $unwind: "$coachInfo"},
        { $group: {_id: "$coachInfo.name", studentCount: { $sum: 1} }}
    ]);

    //  Attendance trends (for Bar graph)
    const attendanceTrends = await Attendance.aggregate([
        { $match : { date: { $gte: sevendaysAgo }}},
        { $group : { 
            _id: { $dateToString:  { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 }
        }},
        { $sort: { "_id": 1 } }
    ]);

    // Recent users
    const recentUsers = await User.find({ role: 'member' }).sort({ createdAt: -1 }).limit(5).select('name email status')

    //  Recent payments
    const recentPayments = await Payment.find().populate('member', 'name').sort({ createdAt: -1 }).limit(5);

    return {
        recentRevenue : revenueStats[0]?.total || 0,
        totalMembers: await User.countDocuments({ role: 'member' }),
        memberStatusDistribution: statusStats,
        revenueHistory : monthlyRevenue,
        coachWorklooad : coachStats,
        attendanceTrends,
        recentUsers,
        recentPayments
    }

}

export const getMemberStats = async (userId: string) => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear   = new Date(currentYear, 11, 31, 23, 59, 59);

    // Full attendance history for the year (for chart + streak)
    const attendanceHistory = await Attendance.find({
        user: userId,
        date: { $gte: startOfYear, $lte: endOfYear }
    }).select('date status').sort({ date: 1 });

    // Latest subscription with plan details
    const subscription = await Subscription.findOne({ member: userId })
        .populate('plan', 'name price durationDays')
        .sort({ createdAt: -1 });

    // Progress records (most recent first, limit 10 for chart)
    const progressRecords = await MemberProgress.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('weight bodyFat createdAt');

    // Recent payments (last 4)
    const recentPayments = await Payment.find({ member: userId })
        .populate('plan', 'name')
        .sort({ createdAt: -1 })
        .limit(4)
        .select('amount plan invoinceNo createdAt method');

    return {
        attendanceHistory,
        subscription,
        progressRecords,
        recentPayments,
    };
};