import dotenv from "dotenv";
import express, { urlencoded } from "express";
import cloudinary from "cloudinary";
import cors from "cors";
import uploadRoutes from "./routes/cloudinary.js";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", uploadRoutes);

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
