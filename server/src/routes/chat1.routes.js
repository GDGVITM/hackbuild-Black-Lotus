import express from "express";
import { getMessages, createRoom, sendMessage } from "../controllers/chat1.controller.js";

const router = express.Router();

// Get messages in a room
router.get("/messages/:chatRoomId", getMessages);

// Create a chat room
router.post("/rooms", createRoom);
router.post("/messages", sendMessage);
export default router;
