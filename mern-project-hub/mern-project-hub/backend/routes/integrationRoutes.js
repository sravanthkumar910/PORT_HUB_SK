import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import {
  connectGithub, disconnectGithub, getGithubActivity, getRepoStatus,
} from "../controllers/integrations/githubController.js";
import {
  getGoogleAuthUrl, googleCallback, disconnectGoogle,
  getUpcomingEvents, syncTaskToCalendar,
} from "../controllers/integrations/calendarController.js";
import { uploadToDrive, listDriveFiles } from "../controllers/integrations/driveController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// GitHub
router.post("/github/connect", protect, connectGithub);
router.post("/github/disconnect", protect, disconnectGithub);
router.get("/github/activity", protect, getGithubActivity);
router.get("/github/repo/:owner/:repo", protect, getRepoStatus);

// Google (Calendar + Drive share one OAuth connection)
router.get("/google/auth-url", protect, getGoogleAuthUrl);
router.get("/google/callback", googleCallback); // hit by Google redirect, no JWT header available
router.post("/google/disconnect", protect, disconnectGoogle);

router.get("/google/calendar/events", protect, getUpcomingEvents);
router.post("/google/calendar/sync-task/:taskId", protect, syncTaskToCalendar);

router.post("/google/drive/upload", protect, upload.single("file"), uploadToDrive);
router.get("/google/drive/files", protect, listDriveFiles);

export default router;
