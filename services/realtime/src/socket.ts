import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    //creating socket.io server on the top of http server
    cors: {
      origin: "*",
    },
  });

  // Authentication middleware for socket.io to extract user from token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }

<<<<<<< HEAD
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as any;
=======
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
>>>>>>> 34aa840 (feat(restaurant-dashboard): add real-time order management with audio notifications)

      if (!decoded || !decoded.user) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = decoded.user;
      next();
    } catch (error) {
      console.log("❌ socket auth failed: ", error);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    //socket.data.user = { _id: "abc", name: "Rajni", role: "seller", restaurantId: "rest456" }

    if (!user) {
      socket.disconnect();
      return;
    }

    const userId = user._id;

<<<<<<< HEAD
    socket.join(`user:${userId}`);

    if (user.restaurantId) {
      socket.join(`restaurant:${user.restaurantId}`);
=======
    socket.join(`user:${userId}`); //personal room for user

    if (user.restaurantId) {
      socket.join(`restaurant:${user.restaurantId}`); //room for restaurant
>>>>>>> 34aa840 (feat(restaurant-dashboard): add real-time order management with audio notifications)
    }

    console.log("User connected: ", userId);
    console.log("Socket room: ", [...socket.rooms]);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
  return io;
};
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
<<<<<<< HEAD
};
=======
};
>>>>>>> 34aa840 (feat(restaurant-dashboard): add real-time order management with audio notifications)
