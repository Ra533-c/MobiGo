import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI  as string, {
            dbName:"MobiGO",
        });
        console.log("MongoDB connected ✅");
    }catch (error){
        console.log(error);
    }
}

export default connectDB;
