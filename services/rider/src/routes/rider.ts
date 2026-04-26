import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  acceptOrder,
  addRiderProfile,
  fetchMyCurrentOrder,
  fetchMyProfile,
  toggleRiderAvailablity,
  updateOrderStatus,
} from "../controllers/rider.js";
import uploadFile from "../middlewares/multer.js";
const router = express.Router();

router.get("/myprofile", isAuth, fetchMyProfile);
router.patch("/toggle", isAuth, toggleRiderAvailablity);
router.post("/new", isAuth, uploadFile, addRiderProfile);

router.post("/accept/:orderId", isAuth, acceptOrder);
router.get("/current", isAuth, fetchMyCurrentOrder);
router.put("/order/update", isAuth, updateOrderStatus);

export default router;
