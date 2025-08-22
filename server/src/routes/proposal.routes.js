import { Router } from "express";
import {
  createProposal,
  getProposalsForProject,
  getProposalsByStudent,
  updateProposalStatus,
  withdrawProposal,
} from "../controllers/proposal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/projects/:projectId/proposals", verifyJWT, createProposal);
router.get("/projects/:projectId/proposals", verifyJWT, getProposalsForProject);
router.get("/my-proposals", verifyJWT, getProposalsByStudent);
router.patch("/:proposalId/status", verifyJWT, updateProposalStatus);
router.delete("/:proposalId", verifyJWT, withdrawProposal);

export default router;
