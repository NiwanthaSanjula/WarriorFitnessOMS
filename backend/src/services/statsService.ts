import Attendance from "../models/Attendance.js";
import MemberProgress from "../models/MemberProgress.js";
import NutritionPlan from "../models/NutritionPlan.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";



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

export const getCoachStats = async (coachId: string) => {
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);

    // All clients assigned to this coach
    const clients = await User.find({ coach: coachId, role: 'member' })
        .select('_id name email status');

    const clientIds = clients.map(c => c._id);

    // Active clients (with active subscription)
    const activeSubs = await Subscription.find({
        member: { $in: clientIds }, status: 'active'
    }).select('member plan').populate('plan', 'name');

    const activeClientIds = new Set(activeSubs.map((s: any) => s.member.toString()));

    // Clients with no active plan
    const noPlanClients = clients.filter(c => !activeClientIds.has(c._id.toString())).length;

    // 7-day check-ins across all clients
    const recentCheckIns = await Attendance.find({
        user: { $in: clientIds },
        date: { $gte: sevenDaysAgo }
    }).select('user date');

    // Plan counts
    const workoutPlanCount   = await WorkoutPlan.countDocuments({ coach: coachId });
    const nutritionPlanCount = await NutritionPlan.countDocuments({ coach: coachId });

    // Per-client progress summary
    const clientProgress = await Promise.all(clients.map(async (client) => {
        // Latest 2 progress records for weight delta
        const progressRecords = await MemberProgress.find({ user: client._id })
            .sort({ createdAt: -1 }).limit(2).select('weight createdAt');

        const latestWeight = progressRecords[0]?.weight ?? null;
        const weightDelta  = progressRecords.length >= 2
            ? parseFloat((progressRecords[0].weight - progressRecords[1].weight).toFixed(1))
            : null;

        // This month's attendance
        const attendanceCount = await Attendance.countDocuments({
            user: client._id, date: { $gte: startOfMonth }
        });

        // Active subscription plan name
        const sub = activeSubs.find((s: any) => s.member.toString() === client._id.toString());

        return {
            _id:           client._id,
            name:          client.name,
            email:         client.email,
            status:        client.status,
            latestWeight,
            weightDelta,
            progressCount: progressRecords.length,
            attendanceCount,
            planName:      (sub as any)?.plan?.name ?? null,
        };
    }));

    return {
        totalClients:     clients.length,
        activeClients:    activeClientIds.size,
        noPlanClients,
        workoutPlanCount,
        nutritionPlanCount,
        recentCheckIns,
        recentClients:    clients.slice(0, 5),
        clientProgress,
    };
};