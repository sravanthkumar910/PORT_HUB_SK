import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    skills: [{ type: String }], // working/tech skills used

    projectLink: { type: String, default: "" }, // live/demo link
    githubLink: { type: String, default: "" },
    youtubeLink: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },

    githubRepo: { type: String, default: "" }, // "owner/repo" for live GitHub sync

    startDate: { type: Date },
    deadline: { type: Date },

    status: {
      type: String,
      enum: ["not-started", "running", "completed", "on-hold"],
      default: "not-started",
    },

    milestones: [milestoneSchema],
  },
  { timestamps: true }
);

projectSchema.virtual("milestoneProgress").get(function () {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const done = this.milestones.filter((m) => m.completed).length;
  return Math.round((done / this.milestones.length) * 100);
});

projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

export default mongoose.model("Project", projectSchema);
