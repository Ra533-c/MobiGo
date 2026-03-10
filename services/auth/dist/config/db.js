<<<<<<< HEAD
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI, {
            dbName: "MobiGO",
        });
        console.log("MongoDB connected ");
=======
import mongoose from "mongoose";
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "MobiGO",
        });
        console.log("MongoDB connected ✅");
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
    }
    catch (error) {
        console.log(error);
    }
};
<<<<<<< HEAD
exports.default = connectDB;
=======
export default connectDB;
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
