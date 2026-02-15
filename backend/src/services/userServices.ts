import User from "../models/User.js"

// Get all users from the database
export const getAllUsers = async () => {
    // We fetch all user but exclude the passworddHash for security
    return await User.find();
};

// Get single user by ID
export const getUserbyId = async (userId: string) => {
    // Fetch the user by ID and exclude the passwordHash
    return await User.findById(userId);
}