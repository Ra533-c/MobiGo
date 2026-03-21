import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth";
import {
  addMenuItem,
  deleteMenuItem,
  getAllItems,
  toggleMenuItemAvailability,
} from "../controllers/menuitem";

const router = express.Router();

router.post("/new", isAuth, isSeller, addMenuItem);
router.get("/all/:id", isAuth, getAllItems);
router.delete("/:id", isAuth, isSeller, deleteMenuItem);
router.delete("/status/:id", isAuth, isSeller, toggleMenuItemAvailability);

export default router;
