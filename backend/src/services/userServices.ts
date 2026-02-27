import bcrypt from "bcryptjs";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js"
import { subscribeMember } from "./membershipService.js";
import CoachProfile from "../models/CoachProfile.js";
import MemberProfile from "../models/MemberProfile.js";
import AdminProfile from "../models/AdminProfile.js";


//  Manual Register new user
export const createManualUser = async ( userData: any , adminId: string) => {
    const { email, nic, name, planId, role } = userData;


    //  Check if email or nic already exist
    const existing = await User.findOne({ $or: [{ email }, { nic }] } );
    if(existing) throw new Error("User with this email or NIC is already exists");

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(nic, salt)

    const newUser = await User.create({
        ...userData,
        status: (role === 'coach' || role === 'admin' || planId ) ? 'active' : 'pending-payment',
        passwordHash: hashedPassword

    });

    //  Initialize the specific profile bucket based on role
    if (newUser.role === 'member') {
        await MemberProfile.create({ user: newUser._id});
    } else if (newUser.role === 'coach') {
        await CoachProfile.create({ user: newUser._id })
    } else if (newUser.role === 'admin') {
        await AdminProfile.create({ user: newUser._id })
    }

    return newUser;
};

//  Update basic user info
export const updateUser = async (userId: string, updateData: any) => {
    // { new: true } returns the updated document
    // { runValidators: true } ensures NIC/Email format is still valid
    return await User.findByIdAndUpdate(userId, updateData, { 
        new: true, 
        runValidators: true 
    });
};

// Generic Profile Update Service
export const updateSpecialProfile = async (userId: string, role: string, profileData: any, adminId: string) => {
    let profile;
    const options = { upsert: true, new: true, runValidators: true };

    if ( role === 'member') {
        await MemberProfile.findOneAndUpdate({ user: userId}, profileData, options);

        if(profileData.planId) {
            await subscribeMember(userId, profileData.planId, adminId);
        }
    }
    else if (role === 'coach') {
        profile = await CoachProfile.findOneAndUpdate({ user: userId }, profileData, options);
    } else if (role === 'admin') {
        profile = await AdminProfile.findOneAndUpdate({ user: userId }, profileData, options);
    }

    return profile;

}

// Get all users from the database with today's attendance status
export const getAllUsers = async () => {
    // Get today's date normalized to midnight
    const today = new Date();
    today.setHours(0,0,0,0);

    // Aggregation Pipelin
    return await User.aggregate([
        {
            $lookup: {
                from: 'attendances',
                let: { userId: "$_id"},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$user", "$$userId"]},
                                    { $eq: ["$date", today]}
                                ]
                            }
                        }
                    }
                ],
                as: "todayAttendance"
            }
        },
        {
            // Add a boolean field 'isCheckedIn' based on lookup results
            $addFields: {
                isCheckedIn: {
                    $cond: { if: { $gt: [{ $size : "$todayAttendance"}, 0]}, then: true, else: false}
                }
            }
        },
        {
            //  Project fields to exclude sensitive data and the temp array
            $project: {
                passwordHash: 0,
                todayAttendance: 0,
                __v: 0
            }
        }
    ]);

};

// Get single user by ID
export const getUserbyId = async (userId: string) => {
    // Fetch the user by ID and exclude the passwordHash
    const user = await User.findById(userId).populate('coach', '_id name email');
    if (!user) return { user: null };

    let specialProfile = null;

    //  Fetch the profile based on the user's role
    if (user.role === 'member') specialProfile = await MemberProfile.findOne({ user: userId }) 
    if (user.role === 'coach') specialProfile = await CoachProfile.findOne({ user: userId }) 
    if (user.role === 'admin') specialProfile = await AdminProfile.findOne({ user: userId }) 

    const subscription = await Subscription.findOne({ member: userId })
        .populate('plan', 'name price durationDays')
        .sort({ createdAt: -1 }); // Get the newset one first

    return {
        user,
        subscription,
        specialProfile
    }
}

// Assign coach to a member
export const assignCoach = async (memberId: string, coachId: string) => {
    // Update the member's coach filed and return the new doc.
    // .populate allows us to return the full coach object instead of just the ID
    return await User.findByIdAndUpdate(
        memberId,
        { coach: coachId},
        { new: true, runValidators: true }
    ).populate('coach', '_id name email ');
}

export const getMembersByCoach = async ( coachId: string ) => {
    // Find all members assigned to the specified coach
    return (await User.find({ coach: coachId, role: 'member'}).select('_id name email phone createdAt isCheckedIn')).toSorted((a, b) => a.name.localeCompare(b.name));
}