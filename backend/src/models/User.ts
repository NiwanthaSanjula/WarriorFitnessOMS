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
    nic : string;
    passwordHash : string;
    phone: string;
    role : USerRole;
    status : 'active' | 'blocked' | 'pending-payment';
    coach : mongoose.Types.ObjectId | IUser | null;
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
        nic: {
            type: String,
            required: [true, 'please provide your NIC'],
            unique: true,
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Please provide a contact number'],
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
            enum: ['active', 'blocked', 'pending-payment'],
            default: 'pending-payment'
        },
        coach: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }

    }, { timestamps: true},
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;