import bcrypt from "bcryptjs";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js"
import { subscribeMember } from "./membershipService.js";


//  Manual Register new user
export const createManualUser = async ( userData: any , adminId: string) => {
    const { email, nic, name, planId } = userData;


    //  Check if email or nic already exist
    const existing = await User.findOne({ $or: [{ email }, { nic }] } );
    if(existing) throw new Error("User with this email or NIC is already exists");

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(nic, salt)

    const newUser = await User.create({
        ...userData,
        status: planId ? 'active' : 'pending-payment',
        passwordHash: hashedPassword
    });

    // If a plan was selected during registration, create the subscription
    if(planId && newUser.role === 'member') {
        await subscribeMember(newUser._id.toString(), planId, adminId)
    }

    return newUser;
};

//  Update Existing USer
export const updateUser = async ( userId: string, updateData: any ) => {
    // If updating email/NIC, Mongoose 'unique' validator will handle errors
    return await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true})
}

// Get all users from the database wwith today's attendance status
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
                as: "todayAttendnce"
            }
        },
        {
            // Add a boolean field 'isCheckedIn' based on lookup results
            $addFields: {
                isCheckedIn: {
                    $cond: { if: { $gt: [{ $size : "$todayAttendnce"}, 0]}, then: true, else: false}
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

    const subscription = await Subscription.findOne({ member: userId })
        .populate('plan', 'name price durationDays')
        .sort({ createdAt: -1 }); // Get the newset one first

    return {
        user,
        subscription
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
    return (await User.find({ coach: coachId}).select('name email isCheckedIn')).toSorted((a, b) => a.name.localeCompare(b.name));
}