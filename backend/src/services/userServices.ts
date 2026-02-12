import User from "../models/User.js"

// Get all users from the database
export const getAllUsers = async () => {
    // We fetch all user but exclude the passwoedHash for security
    return await User.find();
};