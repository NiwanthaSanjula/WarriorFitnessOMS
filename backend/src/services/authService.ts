import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

// Register new user
export const registerUser = async ( userData : any) => {
    const { name, email, password, role } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('User with this email already exists', 400 );
    }

    // Hash the password
    const salt =  await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create the user in DB
    const newUser = await User.create ({
        name,
        email, 
        passwordHash : hashedPassword,
        role : role || 'member'
    });

    return newUser
}

export const loginUser = async ( loginData : any) => {
    const { email, password } = loginData;

    // Check if email and pw exist
    if(!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    // Find user and EXPLICITY ask for password (bcs set select: false in Model)
    const user = await User.findOne({ email}).select('+passwordHash');

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new AppError('Incorrect email or password', 401);
    }
    return user;
}