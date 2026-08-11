import asyncHandler from "express-async-handler";
import Document from "../models/Document.js";

export const getDocuments = asyncHandler(async (req, res) => {
  const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(docs);
});

// Called after the frontend uploads a file directly to the user's connected
// Google Drive (see integrations/driveController.js) - we just save the metadata.
export const createDocument = asyncHandler(async (req, res) => {
  const { project, projectName, fileType, fileName, driveFileId, driveViewLink } = req.body;
  if (!fileName) {
    res.status(400);
    throw new Error("fileName is required");
  }
  const doc = await Document.create({
    user: req.user._id, project, projectName, fileType, fileName, driveFileId, driveViewLink,
  });
  res.status(201).json(doc);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    res.status(404);
    throw new Error("Document not found");
  }
  res.json({ message: "Document deleted" });
});
