import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Proposal } from "../models/proposal.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const initiateConversation = asyncHandler(async (req, res) => {
  const { proposalId } = req.body;
  const clientId = req.user._id;

  if (!proposalId) {
    throw new ApiError(400, "Proposal ID is required");
  }

  let conversation = await Conversation.findOne({ proposal: proposalId });

  if (!conversation) {
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      throw new ApiError(404, "Proposal not found");
    }

    conversation = await Conversation.create({
      proposal: proposalId,
      participants: [clientId, proposal.student],
    });
  }

  return res.status(201).json({
    statusCode: 200,
    message: "Conversation initiated successfully",
    conversation, // 👈 cleaner response shape
  });
});

const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("📩 Fetching messages for conversation:", id);

  const messages = await Message.find({ conversation: id })
    .sort({ createdAt: -1 })
    .populate("sender", "name profilePicture");

  console.log("📩 Found messages:", messages.length);
  return res.status(200).json(new ApiResponse(200, "ok", messages.reverse()));
});

const getMyConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({ participants: userId })
    .populate({
      path: "participants",
      select: "name profilePicture email",
    })
    .sort({ updatedAt: -1 });

  const conversationsWithLastMessage = await Promise.all(
    conversations.map(async (convo) => {
      const lastMessage = await Message.findOne({ conversation: convo._id }).sort({
        createdAt: -1,
      });
      return {
        ...convo.toObject(),
        lastMessage,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User conversations retrieved successfully",
        conversationsWithLastMessage
      )
    );
});

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params; // conversationId
    const { sender, content } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const message = new Message({
      conversation: id,
      sender,
      content,
    });
    await message.save();
    await message.populate("sender", "name profilePicture");

    // emit with socket.io
    req.io.to(id).emit("newMessage", message);

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export { initiateConversation, getMessages, getMyConversations, sendMessage };
