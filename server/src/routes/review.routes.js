import { Router } from "express";
import {
  createReview,
  getReviewsForProject,
  getReviewsForUser,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:contractId").post(createReview);

router.route("/project/:projectId").get(getReviewsForProject);

router.route("/user/:userId").get(getReviewsForUser);

export default router;
