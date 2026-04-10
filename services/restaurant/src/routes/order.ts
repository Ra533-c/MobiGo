import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  fetchSingleOrder,
  getMyOrder,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();

router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);

router.get("/:restaurantId", isAuth, isSeller, fetchRestaurantOrders);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);

router.get("/my", isAuth, isSeller, getMyOrder);
router.get("/:id", isAuth, isSeller, fetchSingleOrder);

export default router;
