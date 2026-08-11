import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";

export const getProjects = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.json(projects);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json(project);
});

export const createProject = asyncHandler(async (req, res) => {
  const {
    name, description, skills, projectLink, githubLink, youtubeLink,
    linkedinLink, githubRepo, startDate, deadline, status, milestones,
  } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Project name is required");
  }

  const project = await Project.create({
    user: req.user._id,
    name, description, skills, projectLink, githubLink, youtubeLink,
    linkedinLink, githubRepo, startDate, deadline, status, milestones,
  });
  res.status(201).json(project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ message: "Project deleted" });
});

// Milestone sub-operations
export const addMilestone = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  project.milestones.push({ title });
  await project.save();
  res.status(201).json(project);
});

export const toggleMilestone = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) {
    res.status(404);
    throw new Error("Milestone not found");
  }
  milestone.completed = !milestone.completed;
  milestone.completedAt = milestone.completed ? new Date() : null;
  await project.save();
  res.json(project);
});
