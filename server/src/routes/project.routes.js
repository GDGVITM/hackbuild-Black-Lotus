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

router.use(verifyJWT);

router.route("/").post(createProject).get(getAllProjects);

router.route("/:projectId").get(getProjectById).patch(updateProject).delete(deleteProject);

router.route("/client/:clientId").get(getProjectsByClient);

export default router;
