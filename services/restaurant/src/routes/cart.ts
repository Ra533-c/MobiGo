import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addToCart,
  clearCart,
  decreamentCartItem,
  fetchMyCart,
  increamentCartItem,
} from "../controllers/cart.js";

const router = express.Router();

router.post("/add", isAuth, addToCart);
router.get("/all", isAuth, fetchMyCart);
router.put("/inc", isAuth, increamentCartItem);
router.put("/dec", isAuth, decreamentCartItem);
router.delete("/clear", isAuth, clearCart);

export default router;
