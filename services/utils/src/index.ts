import "dotenv/config.js";
import express, { urlencoded } from "express";
import cloudinary from "cloudinary";
import cors from "cors";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import uploadRoutes from "./routes/cloudinary.js";
import paymentRoutes from "./routes/payment.js";

const app = express();

// dotenv.config();

connectRabbitMQ();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", uploadRoutes);
app.use("/api/payment", paymentRoutes);

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KET } = process.env;

if (!CLOUD_NAME || !CLOUD_SECRET_KET || !CLOUD_API_KEY) {
  throw new Error("Missing Cloudinary Env Variables");
}

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KET,
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Utils server running on port ${PORT}`);
});
