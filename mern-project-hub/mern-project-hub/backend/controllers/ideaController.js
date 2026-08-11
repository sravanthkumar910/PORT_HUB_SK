import asyncHandler from "express-async-handler";
import Idea from "../models/Idea.js";

export const getIdeas = asyncHandler(async (req, res) => {
  const ideas = await Idea.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(ideas);
});

export const getIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findOne({ _id: req.params.id, user: req.user._id });
  if (!idea) {
    res.status(404);
    throw new Error("Idea not found");
  }
  res.json(idea);
});

export const createIdea = asyncHandler(async (req, res) => {
  const { name, description, status, photoUrl, fileUrl, referenceLink } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Idea name is required");
  }
  const idea = await Idea.create({
    user: req.user._id,
    name,
    description,
    status,
    photoUrl,
    fileUrl,
    referenceLink,
  });
  res.status(201).json(idea);
});

export const updateIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!idea) {
    res.status(404);
    throw new Error("Idea not found");
  }
  res.json(idea);
});

export const deleteIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!idea) {
    res.status(404);
    throw new Error("Idea not found");
  }
  res.json({ message: "Idea deleted" });
});
