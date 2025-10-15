import mongoose from "mongoose";
import { DB_NAME } from "../constants";

export async function connectDatabase() {
    try {
        const MONGO_URI = `${process.env.MONGO_HOST!}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(MONGO_URI);
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error ", error);
        process.exit(1);
    }
};