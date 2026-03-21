import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import restaurantRoutes from "./routes/restaurant.js";
import cors from "cors";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/restaurant", restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Restaurant server running on port ${PORT}`);
  connectDB();
});
