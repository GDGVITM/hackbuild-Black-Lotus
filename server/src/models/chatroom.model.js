import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
