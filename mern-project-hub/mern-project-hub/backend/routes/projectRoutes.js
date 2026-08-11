import express from "express";
import {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMilestone, toggleMilestone,
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
router.post("/:id/milestones", addMilestone);
router.patch("/:id/milestones/:milestoneId/toggle", toggleMilestone);

export default router;
