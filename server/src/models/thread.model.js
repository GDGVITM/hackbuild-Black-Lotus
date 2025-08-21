import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  title: String,
  text: String,
  imageUrl: String,
  userName: String,
  userId: String,
  topic: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  tags: [String],
  likes: [{ type: String }],
  dislikes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Thread = mongoose.model("Thread", threadSchema);

export { Thread };
