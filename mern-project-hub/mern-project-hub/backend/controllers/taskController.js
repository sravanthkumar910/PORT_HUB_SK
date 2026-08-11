import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ deadline: 1 });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const { name, deadline, timing, status } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Task name is required");
  }
  const task = await Task.create({ user: req.user._id, name, deadline, timing, status });
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json({ message: "Task deleted" });
});
