import express from "express";
import { updateProfile, updateSettings, changePassword } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.put("/profile", updateProfile);
router.put("/settings", updateSettings);
router.put("/password", changePassword);

export default router;
