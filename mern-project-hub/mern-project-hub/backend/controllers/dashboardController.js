import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Idea from "../models/Idea.js";
import Task from "../models/Task.js";
import ProjectStore from "../models/ProjectStore.js";

// Aggregated numbers that power the dashboard cards + charts.
// This is the "live monitoring" summary - counts, running projects,
// upcoming deadlines and milestone completion.
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalProjects, totalIdeas, runningProjects, completedProjects, storeCount, tasks] =
    await Promise.all([
      Project.countDocuments({ user: userId }),
      Idea.countDocuments({ user: userId }),
      Project.find({ user: userId, status: "running" }).sort({ deadline: 1 }),
      Project.countDocuments({ user: userId, status: "completed" }),
      ProjectStore.countDocuments({ user: userId }),
      Task.find({ user: userId }).sort({ deadline: 1 }).limit(5),
    ]);

  const allProjects = await Project.find({ user: userId });

  let totalMilestones = 0;
  let completedMilestones = 0;
  allProjects.forEach((p) => {
    totalMilestones += p.milestones.length;
    completedMilestones += p.milestones.filter((m) => m.completed).length;
  });

  const ideasByStatus = await Idea.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const projectsByStatus = await Project.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const upcomingDeadlines = await Project.find({
    user: userId,
    deadline: { $gte: new Date() },
    status: { $ne: "completed" },
  })
    .sort({ deadline: 1 })
    .limit(5)
    .select("name deadline status");

  res.json({
    counts: {
      totalProjects,
      totalIdeas,
      runningProjectsCount: runningProjects.length,
      completedProjects,
      storeCount,
      milestoneProgress: totalMilestones
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0,
    },
    runningProjects,
    upcomingTasks: tasks,
    upcomingDeadlines,
    ideasByStatus,
    projectsByStatus,
  });
});
