import WorkoutPlan from "../models/WorkoutPlan.js";
import NutritionPlan from "../models/NutritionPlan.js";
import MemberPlan from "../models/MemberPlan.js";
import User from "../models/User.js";

// ─── WORKOUT PLAN CRUD ────────────────────────────────────────────

export const createWorkoutPlan = async (coachId: string, data: any) => {
    return await WorkoutPlan.create({ ...data, coach: coachId });
};

export const getCoachWorkoutPlans = async (coachId: string) => {
    return await WorkoutPlan.find({ coach: coachId })
        .sort({ createdAt: -1 }).lean();
};

export const getWorkoutPlanById = async (planId: string, coachId: string) => {
    const plan = await WorkoutPlan.findById(planId).lean();
    if (!plan) throw new Error("Plan not found");
    if (plan.coach.toString() !== coachId) throw new Error("Unauthorized");
    return plan;
};

export const updateWorkoutPlan = async (
    planId: string, coachId: string, data: any
) => {
    const plan = await WorkoutPlan.findById(planId);
    if (!plan) throw new Error("Plan not found");
    if (plan.coach.toString() !== coachId) throw new Error("Unauthorized");
    return await WorkoutPlan.findByIdAndUpdate(planId, data, { new: true });
};

export const deleteWorkoutPlan = async (planId: string, coachId: string) => {
    const plan = await WorkoutPlan.findById(planId);
    if (!plan) throw new Error("Plan not found");
    if (plan.coach.toString() !== coachId) throw new Error("Unauthorized");
    // Check no active assignments before deleting
    const activeAssignments = await MemberPlan.countDocuments({
        plan: planId, status: 'active'
    });
    if (activeAssignments > 0)
        throw new Error("Cannot delete a plan that has active assignments");
    await WorkoutPlan.findByIdAndDelete(planId);
};

// ─── NUTRITION PLAN CRUD ──────────────────────────────────────────

export const createNutritionPlan = async (coachId: string, data: any) => {
    return await NutritionPlan.create({ ...data, coach: coachId });
};

export const getCoachNutritionPlans = async (coachId: string) => {
    return await NutritionPlan.find({ coach: coachId })
        .sort({ createdAt: -1 }).lean();
};

export const getNutritionPlanById = async (planId: string, coachId: string) => {
    const plan = await NutritionPlan.findById(planId).lean();
    if (!plan) throw new Error("Plan not found");
    if (plan.coach.toString() !== coachId) throw new Error("Unauthorized");
    return plan;
};

export const updateNutritionPlan = async (
    planId: string, coachId: string, data: any
) => {
    const plan = await NutritionPlan.findById(planId);
    if (!plan) throw new Error("Plan not found");
    if (plan.coach.toString() !== coachId) throw new Error("Unauthorized");
    return await NutritionPlan.findByIdAndUpdate(planId, data, { new: true });
};

export const deleteNutritionPlan = async (planId: string, coachId: string) => {
    const plan = await NutritionPlan.findById(planId);
    if (!plan) throw new Error("Plan not found");
    if (plan.coach.toString() !== coachId) throw new Error("Unauthorized");
    const active = await MemberPlan.countDocuments({ plan: planId, status: 'active' });
    if (active > 0) throw new Error("Cannot delete a plan with active assignments");
    await NutritionPlan.findByIdAndDelete(planId);
};

// ─── ASSIGNMENTS ──────────────────────────────────────────────────

export const assignPlanToMember = async (
    coachId: string,
    memberId: string,
    planType: 'workout' | 'nutrition', // Received from frontend
    planId: string,
    startDate?: Date,
    coachNotes?: string
) => {
    const member = await User.findOne({ _id: memberId, coach: coachId });
    if (!member) throw new Error("Member not assigned to you");

    //  Map lowercase type to the capitalized Model Name required by your new Schema
    const mappedPlanType = planType === 'workout' ? 'WorkoutPlan' : 'NutritionPlan';

    // Deactivate existing active plan using the MAPPED type
    await MemberPlan.updateMany(
        { member: memberId, planType: mappedPlanType, status: 'active' }, 
        { status: 'cancelled' }
    );

    // Create the new assignment
    return await MemberPlan.create({
        member: memberId,
        coach: coachId,
        planType: mappedPlanType, // 'WorkoutPlan' or 'NutritionPlan'
        plan: planId,
        status: 'active',
        startDate: startDate || new Date(),
        coachNotes: coachNotes || ""
    });
};

export const getMemberActivePlans = async (memberId: string) => {
    try {
     
        const workout = await MemberPlan.findOne({
            member: memberId, 
            planType: 'WorkoutPlan', 
            status: 'active'
        }).populate('plan').lean();

        const nutrition = await MemberPlan.findOne({
            member: memberId, 
            planType: 'NutritionPlan', 
            status: 'active'
        }).populate('plan').lean();

        return { 
            workout: workout || null, 
            nutrition: nutrition || null 
        };
    } catch (error) {
        console.error("Fetch Error:", error);
        return { workout: null, nutrition: null };
    }
};

export const getMemberPlanHistory = async (memberId: string) => {
    return await MemberPlan.find({ member: memberId })
        .populate('plan', 'title goal durationWeeks')
        .sort({ createdAt: -1 })
        .lean();
};

export const updatePlanAssignmentStatus = async (
    assignmentId: string,
    coachId: string,
    status: 'completed' | 'paused' | 'cancelled'
) => {
    const assignment = await MemberPlan.findById(assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.coach.toString() !== coachId) throw new Error("Unauthorized");
    return await MemberPlan.findByIdAndUpdate(
        assignmentId,
        { status, ...(status === 'completed' ? { endDate: new Date() } : {}) },
        { new: true }
    );
};

// Used by coach member detail page — get both active plans for a member
export const getCoachMemberPlans = async (memberId: string, coachId: string) => {
    const member = await User.findOne({ _id: memberId, coach: coachId });
    if (!member) throw new Error("Member not assigned to you");
    return await getMemberActivePlans(memberId);
};