import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, title, bio, skills, avatarUrl } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = name;
  if (title !== undefined) user.title = title;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = skills;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  await user.save();
  res.json(user.toSafeObject());
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { theme, notifications, defaultView } = req.body;
  const user = await User.findById(req.user._id);

  if (theme !== undefined) user.settings.theme = theme;
  if (notifications !== undefined) user.settings.notifications = notifications;
  if (defaultView !== undefined) user.settings.defaultView = defaultView;

  await user.save();
  res.json(user.toSafeObject());
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});
