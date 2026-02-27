import Attendance from "../models/Attendance.js";
import Payment from "../models/Payment.js";
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