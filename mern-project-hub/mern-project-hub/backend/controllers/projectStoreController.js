import asyncHandler from "express-async-handler";
import ProjectStore from "../models/ProjectStore.js";

export const getStoreItems = asyncHandler(async (req, res) => {
  const items = await ProjectStore.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});

export const createStoreItem = asyncHandler(async (req, res) => {
  const { name, description, deployedLink, linkedinLink, processType, project } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Project name is required");
  }
  const item = await ProjectStore.create({
    user: req.user._id, name, description, deployedLink, linkedinLink, processType, project,
  });
  res.status(201).json(item);
});

export const updateStoreItem = asyncHandler(async (req, res) => {
  const item = await ProjectStore.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }
  res.json(item);
});

export const deleteStoreItem = asyncHandler(async (req, res) => {
  const item = await ProjectStore.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }
  res.json({ message: "Item deleted" });
});
