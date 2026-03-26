import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  addRestaurant,
  fetchMyRestaurant,
  fetchSingleRestuarant,
  getNearbyRestaurant,
  updateRestuarant,
  updateStatusRestaurant,
} from "../controllers/restaurant.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

// routes for seller
router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);
router.get("/my", isAuth, isSeller, fetchMyRestaurant);
router.put("/status", isAuth, isSeller, updateStatusRestaurant);
router.put("/edit", isAuth, isSeller, updateRestuarant);

// routes for user
router.get("/all",isAuth,getNearbyRestaurant);
router.get("/:id",isAuth,fetchSingleRestuarant);

export default router;
