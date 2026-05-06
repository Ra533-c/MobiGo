import { connectDB } from "../config/db.js";

export const getRestuarantCollection = async () => {
  const db = await connectDB();

  return db.collection("restraurants");
};

export const getRiderCollection = async () => {
  const db = await connectDB();

  return db.collection("riders");
};
