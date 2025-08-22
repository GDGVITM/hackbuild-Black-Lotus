import { Router } from "express";
import {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectsByClient,
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Routes
router.get("/", getAllProjects);
router.get("/:projectId", getProjectById);
router.get("/client/:clientId", getProjectsByClient);

// Authenticated Routes (require a valid JWT)
// Applying verifyJWT middleware to all routes that modify project data
router.post("/", verifyJWT, createProject);
router.patch("/:projectId", verifyJWT, updateProject);
router.delete("/:projectId", verifyJWT, deleteProject);

export default router;
