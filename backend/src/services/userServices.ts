import User from "../models/User.js"

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
    return await User.findById(userId);
}