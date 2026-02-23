import MembershipPlan, { IMembershipPlan } from "../models/MembershipPlan.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

export const createPlan = async (planData: Partial<IMembershipPlan>) => {
    return await MembershipPlan.create(planData);
};

export const getAllPlans = async () => {
    return await MembershipPlan.find()
}

export const subscribeMember = async (memberId: string, planId: string, adminId: string) => {
    const plan = await MembershipPlan.findById(planId);
    if (!plan) throw new Error('Plan not Found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    //  Clean up old active subscriptions first
    //  This ensures a member only has ONE active plan at a time.
    await Subscription.updateMany(
        { member: memberId, status: 'active'},
        { status: 'expired'}
    )


    //  Create the subscription record [ cite: 266, 267]
    const subscription =  await Subscription.create({
        member:memberId,
        plan: planId,
        startDate,
        endDate,
        status: 'active'
    })

    //  Generate payment record
    await Payment.create({
        member: memberId,
        subscription: subscription._id,
        plan: planId,
        amount: plan.price,
        method: 'cash', // Default to cash as per plan
        invoinceNo: `INV-${Date.now()}`,
        recoredBy: adminId
    });

    // Update user status
    await User.findByIdAndUpdate(memberId, { status: 'active' });

    return subscription
}

export const getPaymentByMember = async (memberId: string, page: number = 1, limit: number = 12) => {

    const skip = (page - 1) * limit

    //  Fetch the specific page of data
    const payments = await Payment.find({ member: memberId})
        .populate('member', 'name email nic')
        .populate('plan', 'name')
        .populate('recoredBy', 'name')
        .sort({ createdAt: -1})
        .skip(skip)
        .limit(limit)

    const totalPayments = await Payment.countDocuments({ member: memberId });

    return {
        payments,
        paginations: {
            total: totalPayments,
            pages: Math.ceil(totalPayments / limit),
            currentPage: page
        }
    };
};

export const getAllPayments = async (page: number = 1, limit: number = 15, search: string = '') => {
    const skip = (page - 1) * limit;

    //  Search logic: If search exists, look for it in invoinceNo
    const query = search ? { invoinceNo: { $regex: search, $options: 'i'}} : {}

    const payments = await Payment.find(query)
        .populate('member', 'name email nic')
        .populate('plan', 'name price')
        .populate('recoredBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Count total records for stats
    const total = await Payment.countDocuments(query);

    //  Count total amount for stats
    const stats = await Payment.aggregate([
        { $match: query }, // Filter by search if applicable
        { $group: { _id: null, totalIncome: { $sum: "$amount"} }}
    ]);

    const totalIncome = stats.length > 0 ? stats[0].totalIncome : 0

    return {
        payments,
        paginations: {
            total,
            totalIncome,
            page: Math.ceil(total / limit),
            currentPage: page
        }
    };
}