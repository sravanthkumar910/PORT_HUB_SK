import mongoose from "mongoose";

const projectStoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    deployedLink: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },
    processType: {
      type: String,
      enum: ["client-work", "personal", "open-source", "freelance", "learning"],
      default: "personal",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProjectStore", projectStoreSchema);
