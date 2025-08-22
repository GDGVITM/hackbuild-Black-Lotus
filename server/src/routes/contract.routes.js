import { Router } from "express";
import {
  createContract,
  getContractById,
  getUserContracts,
  updateMilestoneStatus,
  fundEscrow,
} from "../controllers/contract.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:proposalId").post(createContract);
router.route("/my-contracts").get(getUserContracts);
router.route("/:contractId").get(getContractById);
router.route("/:contractId/milestones/:milestoneId").patch(updateMilestoneStatus);
router.route("/:contractId/fund").post(fundEscrow);

export default router;
