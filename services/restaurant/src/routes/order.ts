import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  assignRiderToOrder,
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  fetchSingleOrder,
  getCurrentOrdersForRider,
  getMyOrder,
  updateOrderStatus,
  updateOrderStatusByRider,
} from "../controllers/order.js";

const router = express.Router();

router.get("/my", isAuth, getMyOrder);
router.get("/:id", isAuth, fetchSingleOrder);

router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);

router.get("/restaurant/:restaurantId", isAuth, isSeller, fetchRestaurantOrders);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);

router.put("/assign/rider",assignRiderToOrder);
router.get("/current/rider",getCurrentOrdersForRider);
router.put("/update/status/rider",updateOrderStatusByRider);



export default router;
