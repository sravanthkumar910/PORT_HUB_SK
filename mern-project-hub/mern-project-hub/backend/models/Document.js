import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    projectName: { type: String, default: "" }, // free text label if not linked to a Project
    fileType: {
      type: String,
      enum: ["pdf", "ppt", "doc", "other"],
      default: "other",
    },
    fileName: { type: String, required: true },
    driveFileId: { type: String, default: "" }, // Google Drive file id
    driveViewLink: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
