import express from "express";
import {
  getStoreItems, createStoreItem, updateStoreItem, deleteStoreItem,
} from "../controllers/projectStoreController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.route("/").get(getStoreItems).post(createStoreItem);
router.route("/:id").put(updateStoreItem).delete(deleteStoreItem);

export default router;
