<<<<<<< HEAD
﻿import { Request , Response , RequestHandler , NextFunction } from "express";
=======
import { Request , Response , RequestHandler , NextFunction } from "express";
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099

const TryCatch = (handler:RequestHandler):RequestHandler =>{
    return async (req:Request , res:Response , next:NextFunction)=>{
        try{
            await handler(req,res,next);
        }catch(err:any){
            res.status(500).json({
                message:err.message
            });
        }
    }
}
<<<<<<< HEAD
export default TryCatch;
=======
export default TryCatch;
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
