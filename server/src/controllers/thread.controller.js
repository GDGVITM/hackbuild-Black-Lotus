import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Thread } from "../models/thread.model.js";
import { Topic } from "../models/topic.model.js";

// Fetches all threads, sorted by creation date.
const getAllThreads = asyncHandler(async (req, res) => {
  const threads = await Thread.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, threads, "Threads fetched successfully"));
});

// Creates a new thread or reply.
const createThread = asyncHandler(async (req, res) => {
  const { title, text, parentId, imageUrl, tags, topic } = req.body;
  const userName = req.user.name || req.user.email;
  const userId = req.user.uid;

  if (!parentId && !topic) {
    throw new ApiError(400, "A topic is required for a new thread.");
  }

  // Find or create the topic to ensure it exists.
  await Topic.findOneAndUpdate(
    { name: topic },
    { $setOnInsert: { name: topic } },
    { upsert: true }
  );

  const newThread = await Thread.create({
    title,
    text,
    parentId,
    imageUrl,
    tags,
    topic,
    userName,
    userId,
  });

  // Emit a Socket.IO event to all connected clients.
  req.app.get("io").emit("new-thread", newThread);

  return res.status(201).json(new ApiResponse(201, newThread, "Thread created successfully"));
});

// Handles liking a thread.
const likeThread = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const { uid } = req.user;

  const thread = await Thread.findById(threadId);
  if (!thread) {
    throw new ApiError(404, "Thread not found.");
  }

  // Remove dislike if it exists
  thread.dislikes.pull(uid);

  // Toggle the like
  const hasLiked = thread.likes.includes(uid);
  if (hasLiked) {
    thread.likes.pull(uid);
  } else {
    thread.likes.push(uid);
  }

  await thread.save();

  // Emit a Socket.IO event to all connected clients.
  req.app.get("io").emit("update-thread", thread);

  return res.status(200).json(new ApiResponse(200, thread, "Thread liked successfully"));
});

// Handles disliking a thread.
const dislikeThread = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const { uid } = req.user;

  const thread = await Thread.findById(threadId);
  if (!thread) {
    throw new ApiError(404, "Thread not found.");
  }

  // Remove like if it exists
  thread.likes.pull(uid);

  // Toggle the dislike
  const hasDisliked = thread.dislikes.includes(uid);
  if (hasDisliked) {
    thread.dislikes.pull(uid);
  } else {
    thread.dislikes.push(uid);
  }

  await thread.save();

  // Emit a Socket.IO event to all connected clients.
  req.app.get("io").emit("update-thread", thread);

  return res.status(200).json(new ApiResponse(200, thread, "Thread disliked successfully"));
});

export { getAllThreads, createThread, likeThread, dislikeThread };
