import express from "express";
import { getMessages } from "../controllers/chat1.controller.js";

const router = express.Router();

router.get("/messages/:chatRoomId", getMessages);

export default router;
