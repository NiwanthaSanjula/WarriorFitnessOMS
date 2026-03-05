import dotenv from 'dotenv';
dotenv.config();

import { initCloudinary } from './config/cloudinary.js';
initCloudinary();

import mongoose from 'mongoose';
import app from './app.js';

// Railway sets PORT in environment variable
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

const startServer = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables!');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB : Warrior Fitness Database');

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database Connection Failed:', error);
        process.exit(1);
    }
};

startServer();