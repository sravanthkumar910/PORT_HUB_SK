import asyncHandler from "express-async-handler";
import { google } from "googleapis";
import { Readable } from "stream";
import { getOAuthClient } from "../../config/googleClient.js";
import User from "../../models/User.js";

const clientForUser = (user) => {
  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials({
    access_token: user.integrations.google.accessToken,
    refresh_token: user.integrations.google.refreshToken,
    expiry_date: user.integrations.google.expiryDate,
  });
  return oAuth2Client;
};

// @route POST /api/integrations/google/drive/upload
// multipart/form-data with a single "file" field.
// Uploads straight into the connected Google Drive account and returns a
// shareable link - the frontend then saves that link via /api/documents.
export const uploadToDrive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.integrations.google?.connected) {
    res.status(400);
    throw new Error("Google Drive is not connected");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const auth = clientForUser(user);
  const drive = google.drive({ version: "v3", auth });

  const { data: file } = await drive.files.create({
    requestBody: {
      name: req.file.originalname,
      parents: [], // root of My Drive; pass a folder id here to file into a "Project Hub" folder
    },
    media: {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer),
    },
    fields: "id, webViewLink, name",
  });

  // Make it viewable by anyone with the link (adjust to your privacy needs)
  await drive.permissions.create({
    fileId: file.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  res.status(201).json({
    driveFileId: file.id,
    driveViewLink: file.webViewLink,
    fileName: file.name,
  });
});

// @route GET /api/integrations/google/drive/files
export const listDriveFiles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.integrations.google?.connected) {
    res.status(400);
    throw new Error("Google Drive is not connected");
  }

  const auth = clientForUser(user);
  const drive = google.drive({ version: "v3", auth });

  const { data } = await drive.files.list({
    pageSize: 20,
    fields: "files(id, name, webViewLink, mimeType, modifiedTime)",
    orderBy: "modifiedTime desc",
  });

  res.json(data.files || []);
});
