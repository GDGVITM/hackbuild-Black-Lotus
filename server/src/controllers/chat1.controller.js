import { ChatRoom } from "../models/chatroom.model.js";
import Message from "../models/message.model.js";

export const getMessages = async (req, res) => {
  const { chatRoomId } = req.params;
  try {
    const messages = await Message.find({ chatRoom: chatRoomId }).populate("sender", "name");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages." });
  }
};
