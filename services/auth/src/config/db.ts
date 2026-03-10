<<<<<<< HEAD
﻿import mongoose from "mongoose";
=======
import mongoose from "mongoose";
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI  as string, {
            dbName:"MobiGO",
        });
<<<<<<< HEAD
        console.log("MongoDB connected ");
=======
        console.log("MongoDB connected ✅");
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
    }catch (error){
        console.log(error);
    }
}

export default connectDB;
