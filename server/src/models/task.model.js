import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    title: String,
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
