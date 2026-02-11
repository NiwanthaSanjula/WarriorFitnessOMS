import mongoose, { Schema, Document } from "mongoose";

// Define an Enum for Roles to prevent types
export enum USerRole {
    ADMIN = 'admin',
    COACH = 'coach',
    MEMBER = 'member',
}

// Define a TypeScript interface for the User Document
export interface IUser extends Document {
    name : string;
    email : string;
    passwordHash : string;
    role : USerRole;
    status : 'active' | 'blocked';
    createdAt : Date;
    updatedAt : Date;
}

// Create the Mongoose Schema
const userSchema = new Schema<IUser>(
    {
        name: {
            type : String,
            required : [true, 'Please provide your name'],
            trim : true
        },
        email: {
            type: String,
            required: [true, 'please provide you email'],
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: [true, 'Please provide a password hash'],
            select: false // This hides the password from API response by default (DRY/Security)
        },
        role: {
            type: String,
            enum: Object.values(USerRole),
            default: USerRole.MEMBER
        },
        status: {
            type: String,
            enum: ['active', 'blocked'],
            default: 'active'
        },

    }, { timestamps: true},
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;