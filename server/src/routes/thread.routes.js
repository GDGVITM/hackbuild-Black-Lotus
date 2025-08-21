import { Router } from "express";
import {
  getAllThreads,
  createThread,
  likeThread,
  dislikeThread,
} from "../controllers/thread.controller.js";
import { verifyJWT as authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no auth needed)
router.route("/").get(getAllThreads);

// Secured routes
router.route("/").post(authMiddleware, createThread);
router.route("/:threadId/like").post(authMiddleware, likeThread);
router.route("/:threadId/dislike").post(authMiddleware, dislikeThread);

export default router;
