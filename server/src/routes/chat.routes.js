import { Router } from "express";
import {
  initiateConversation,
  getMessages,
  getMyConversations,
  sendMessage,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Order matters! /my must be before /:id/messages
router.post("/", verifyJWT, initiateConversation);
router.get("/my", verifyJWT, getMyConversations);
router.get("/:id/messages", verifyJWT, getMessages);
router.post("/:id/messages", sendMessage);

export default router;
