import express, { urlencoded } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});
