import MembershipPlan, { IMembershipPlan } from "../models/MembershipPlan.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

export const createPlan = async (planData: Partial<IMembershipPlan>) => {
    return await MembershipPlan.create(planData);
};

export const getAllPlans = async () => {
    return await MembershipPlan.find()
}

export const subscribeMember = async (memberId: string, planId: string) => {
    const plan = await MembershipPlan.findById(planId);
    if (!plan) throw new Error('Plan not Found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    //  Create the subscription record [ cite: 266, 267]
    const subscription =  await Subscription.create({
        member:memberId,
        plan: planId,
        startDate,
        endDate,
        status: 'active'
    })

    await User.findByIdAndUpdate(memberId, { status: 'active' });

    return subscription
}
