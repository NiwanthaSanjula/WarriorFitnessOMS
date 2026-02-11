// This is the file that actually turns the engine on. It connects to MongoDB first, then starts listening for requests.

import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "";

const startServer = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file!");
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB : Warrior Fitness Database');

        app.listen(PORT, () => {
            console.log(`🚀 Server runing in ${process.env.NODE_ENV} mod on http://localhost:${PORT}`);
            
        })
        
    } catch (error) {
        console.error('❌ Databse Connection Failed : ', error);
        process.exit(1); 
        
    }
};

startServer();