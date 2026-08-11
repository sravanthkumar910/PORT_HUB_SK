import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["backlog", "exploring", "in-progress", "parked", "converted"],
      default: "backlog",
    },
    photoUrl: { type: String, default: "" },
    fileUrl: { type: String, default: "" }, // uploaded file (e.g. Drive link)
    referenceLink: { type: String, default: "" }, // any external link
    convertedToProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Idea", ideaSchema);
