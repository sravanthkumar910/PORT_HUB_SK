import asyncHandler from "express-async-handler";
import { google } from "googleapis";
import { getOAuthClient, GOOGLE_SCOPES } from "../../config/googleClient.js";
import User from "../../models/User.js";
import Task from "../../models/Task.js";

// @route GET /api/integrations/google/auth-url
// Frontend redirects the user's browser to this URL to grant Calendar + Drive access.
export const getGoogleAuthUrl = asyncHandler(async (req, res) => {
  const oAuth2Client = getOAuthClient();
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    // pass our JWT-authenticated user id through state so the callback
    // knows which user to attach the tokens to
    state: req.user._id.toString(),
  });
  res.json({ url });
});

// @route GET /api/integrations/google/callback  (hit by Google, not the frontend directly)
export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const oAuth2Client = getOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);

  const user = await User.findById(state);
  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL}/settings?google=error`);
  }

  oAuth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: oAuth2Client, version: "v2" });
  const { data: profile } = await oauth2.userinfo.get();

  user.integrations.google = {
    connected: true,
    email: profile.email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || user.integrations.google?.refreshToken || "",
    expiryDate: tokens.expiry_date,
  };
  await user.save();

  res.redirect(`${process.env.CLIENT_URL}/settings?google=connected`);
});

export const disconnectGoogle = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.integrations.google = {
    connected: false, email: "", accessToken: "", refreshToken: "", expiryDate: null,
  };
  await user.save();
  res.json({ connected: false });
});

const clientForUser = (user) => {
  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials({
    access_token: user.integrations.google.accessToken,
    refresh_token: user.integrations.google.refreshToken,
    expiry_date: user.integrations.google.expiryDate,
  });
  return oAuth2Client;
};

// @route GET /api/integrations/google/calendar/events
// Live: next 10 upcoming events, used on the Dashboard + Tasks page
export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.integrations.google?.connected) {
    res.status(400);
    throw new Error("Google account is not connected");
  }

  const auth = clientForUser(user);
  const calendar = google.calendar({ version: "v3", auth });

  const { data } = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = (data.items || []).map((e) => ({
    id: e.id,
    title: e.summary,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    link: e.htmlLink,
  }));

  res.json(events);
});

// @route POST /api/integrations/google/calendar/sync-task/:taskId
// Push one Daily Task to the user's real Google Calendar, deadline + timing become the event.
export const syncTaskToCalendar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.integrations.google?.connected) {
    res.status(400);
    throw new Error("Google account is not connected");
  }

  const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const auth = clientForUser(user);
  const calendar = google.calendar({ version: "v3", auth });

  const start = task.deadline ? new Date(task.deadline) : new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const { data } = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: task.name,
      description: `Synced from Project Hub - ${task.timing || ""}`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });

  task.googleCalendarEventId = data.id;
  await task.save();

  res.json({ task, calendarEventId: data.id });
});
