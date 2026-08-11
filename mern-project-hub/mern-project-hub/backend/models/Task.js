import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    deadline: { type: Date },
    timing: { type: String, default: "" }, // e.g. "9:00 AM - 10:00 AM"
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "missed"],
      default: "pending",
    },
    googleCalendarEventId: { type: String, default: "" }, // set when synced to Google Calendar
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
