import express from "express";
import { getIdeas, getIdea, createIdea, updateIdea, deleteIdea } from "../controllers/ideaController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.route("/").get(getIdeas).post(createIdea);
router.route("/:id").get(getIdea).put(updateIdea).delete(deleteIdea);

export default router;
