import MemberProgress from "../models/MemberProgress.js";
import MemberProfile from "../models/MemberProfile.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";

// Add progress update
export const addProgressUpdate = async (
    memberId: string,
    progressData: any,
    coachId?: string
) => {
    // Validate member exists
    const member = await User.findById(memberId);
    if (!member) throw new Error("Member not found");
    
    // Create new progress record
    const newProgress = await MemberProgress.create({
        member: memberId,
        coach: coachId || null,
        ...progressData
    });

    return newProgress;
};

// Get member's progress history
export const getMemberProgress = async (
    memberId: string,
    limit: number = 12,
    page: number = 1
) => {
    const skip = (page - 1) * limit;

    const progressRecords = await MemberProgress.find({ member: memberId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

    const total = await MemberProgress.countDocuments({ member: memberId });

    return {
        records: progressRecords,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

// Get latest progress (for dashboard)
export const getLatestProgress = async (memberId: string) => {
    return await MemberProgress.findOne({ member: memberId })
        .sort({ createdAt: -1 })
        .lean();
};

// Calculate progress comparison
export const getProgressComparison = async (
    memberId: string,
    days: number = 30
) => {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const records = await MemberProgress.find({
        member: memberId,
        createdAt: { $gte: dateFrom }
    }).sort({ createdAt: 1 });

    if (records.length < 2) {
        return {
            startDate: null,
            endDate: null,
            comparison: null,
            message: "Not enough progress data"
        };
    }

    const first = records[0];
    const last = records[records.length - 1];

    return {
        startDate: first.createdAt,
        endDate: last.createdAt,
        comparison: {
            weight: {
                start: first.weight,
                end: last.weight,
                change: last.weight - first.weight,
                changePercent: ((last.weight - first.weight) / first.weight) * 100
            },
            bodyFat: first.bodyFat ? {
                start: first.bodyFat,
                end: last.bodyFat || 0,
                change: (last.bodyFat || 0) - first.bodyFat
            } : null,
            waist: first.waist ? {
                start: first.waist,
                end: last.waist || 0,
                change: (last.waist || 0) - first.waist
            } : null
        },
        records
    };
};

// Coach: Get all assigned members with their latest progress
export const getCoachMembersProgress = async (coachId: string) => {
    // Get all members assigned to this coach
    const members = await User.find({ 
        coach: coachId, 
        role: 'member' 
    }).select('_id name email');

    // Get latest progress for each member
    const membersWithProgress = await Promise.all(
        members.map(async (member) => {
            const latestProgress = await MemberProgress.findOne({ 
                member: member._id 
            }).sort({ createdAt: -1 });

            return {
                member: member._id,
                name: member.name,
                email: member.email,
                latestProgress
            };
        })
    );

    return membersWithProgress;
};

// Update progress with coach notes
export const updateProgressNotes = async (
    progressId: string,
    notes: string,
    coachId: string
) => {
    const progress = await MemberProgress.findByIdAndUpdate(
        progressId,
        { 
            notes,
            coach: coachId
        },
        { new: true }
    );

    return progress;
};

export const getCoachMembersList = async (coachId: string) => {
    const members = await User.find({
        coach: coachId,
        role: 'member'
    }).select('_id name email phone status createdAt');

    const membersWithProgress = await Promise.all(
        members.map(async (member) => {
            const memberProfile = await MemberProfile.findOne({ user: member._id })
                .select('weight height');

            const latestProgress = await MemberProgress.findOne({ user: member._id })
                .sort({ createdAt: -1 })
                .select('weight bodyFat createdAt notes');

            const subscription = await Subscription.findOne({ member: member._id })
                .populate('plan', 'name')
                .sort({ createdAt: -1 });

            return {
                _id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                status: member.status,
                createdAt: member.createdAt,
                baselineWeight: memberProfile?.weight || null,
                currentWeight: latestProgress?.weight || null,
                currentBodyFat: latestProgress?.bodyFat || null,
                lastProgressDate: latestProgress?.createdAt || null,
                subscriptionPlan: subscription?.plan?.name || null
            };
        })
    );

    return membersWithProgress.sort((a, b) => a.name.localeCompare(b.name));
};

//  Get detailed member profile
export const getCoachMemberDetail = async (memberId: string, coachId: string) => {
    const member = await User.findById(memberId);
    if (!member) throw new Error("Member not found");
    
    if (member.coach?.toString() !== coachId) {
        throw new Error("This member is not assigned to you");
    }

    const user = await User.findById(memberId).populate('coach', '_id name email');
    const memberProfile = await MemberProfile.findOne({ user: memberId });
    const subscription = await Subscription.findOne({ member: memberId })
        .populate('plan', 'name price durationDays')
        .sort({ createdAt: -1 });
    const latestProgress = await MemberProgress.findOne({ member: memberId })
        .sort({ createdAt: -1 });

    const progressComparison = await getProgressComparison(memberId, 30);
    const progressHistoryResult = await getMemberProgress(memberId, 10, 1);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            nic: user.nic,
            status: user.status,
            createdAt: user.createdAt,
            coach: user.coach
        },
        memberProfile: memberProfile || null,
        subscription: subscription || null,
        latestProgress: latestProgress || null,
        progressComparison: progressComparison || null,
        progressHistory: progressHistoryResult.records
    };
};

//  Update notes by coach
export const updateProgressNotesByCoach = async (
    progressId: string,
    notes: string,
    coachId: string
) => {
    const progress = await MemberProgress.findByIdAndUpdate(
        progressId,
        { notes, coach: coachId },
        { new: true }
    );
    return progress;
};

export const getProgressChartData = async (
    memberId: string,
    limit: number = 20
) => {
    const records = await MemberProgress.find({ member: memberId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();

    return {
        labels: records.map(r => 
            new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        weight: records.map(r => r.weight),
        bodyFat: records.map(r => r.bodyFat ?? null),
        waist: records.map(r => r.waist ?? null),
        biceps: records.map(r => r.biceps ?? null),
        energyLevel: records.map(r => r.energyLevel ?? null),
        mood: records.map(r => r.mood ?? null),
    };
};

// Get a member's overall fitness summary stats
export const getMemberFitnessSummary = async (
    memberId: string,
    memberHeight?: number  // in cm, from MemberProfile
) => {
    const latest = await MemberProgress.findOne({ member: memberId })
        .sort({ createdAt: -1 }).lean();
    
    const oldest = await MemberProgress.findOne({ member: memberId })
        .sort({ createdAt: 1 }).lean();

    if (!latest) return null;

    const bmi = memberHeight 
        ? parseFloat((latest.weight / Math.pow(memberHeight / 100, 2)).toFixed(1))
        : null;

    const getBmiCategory = (bmi: number | null) => {
        if (!bmi) return null;
        if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
        if (bmi < 25) return { label: 'Normal', color: 'green' };
        if (bmi < 30) return { label: 'Overweight', color: 'yellow' };
        return { label: 'Obese', color: 'red' };
    };

    const totalWeightChange = oldest 
        ? parseFloat((latest.weight - oldest.weight).toFixed(1))
        : 0;

    const totalEntries = await MemberProgress.countDocuments({ member: memberId });

    return {
        currentWeight: latest.weight,
        currentBodyFat: latest.bodyFat,
        bmi,
        bmiCategory: getBmiCategory(bmi),
        totalWeightChange,
        totalEntries,
        lastUpdated: latest.createdAt,
        streak: totalEntries  // you could compute actual streak logic here
    };
};

