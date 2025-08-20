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

router.use(verifyJWT);

router.route("/:projectId").post(createProposal);

router.route("/project/:projectId").get(getProposalsForProject);

router.route("/student/my-proposals").get(getProposalsByStudent);

router.route("/:proposalId/status").patch(updateProposalStatus);

router.route("/:proposalId").delete(withdrawProposal);

export default router;
