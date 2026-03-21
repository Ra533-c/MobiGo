import express from "express";
import { Request, Response } from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { buffer } = req.body;
    const cloud = await cloudinary.v2.uploader.upload(buffer);
    res.json({
      url: cloud.secure_url,
    });
  } catch (error: any) {
    console.log("❌ CLOUDINARY KA ASLI KHOONI ERROR ❌ : ", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
