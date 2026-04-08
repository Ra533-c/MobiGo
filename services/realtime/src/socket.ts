import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io:Server;

export const initSocket =  (server:http.Server)=>{
    io = new Server(server,{ //creating socket.io server on the top of http server
        cors:{
            origin:"*",
        }
    });

    io.use((socket,next)=>{
        try {
            const token = socket.handshake.auth.token;
            if(!token){
                return next(new Error("Unauthorized"))
            };

            const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY!) as any;
        } catch (error) {
            
        }
    });
}