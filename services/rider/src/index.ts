import express from "express";
import dotenv, { config } from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import riderRoutes from "./routes/rider.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();
await connectRabbitMQ();
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api/rider",riderRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Rider server running on port ${process.env.PORT}`);
  connectDB();
});
