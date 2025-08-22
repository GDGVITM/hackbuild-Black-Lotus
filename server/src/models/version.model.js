import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Version", versionSchema);
