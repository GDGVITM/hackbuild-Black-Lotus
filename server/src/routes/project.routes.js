import { Router } from "express";
import {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectsByClient,
} from "../controllers/project.controller.js";
import multer from "multer";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import Version from "../models/version.model.js";
const router = Router();
const upload = multer({ dest: "uploads/" });

// Public Routes
router.get("/", getAllProjects);
router.get("/:projectId", getProjectById);
router.get("/client/:clientId", getProjectsByClient);
router.post("/:projectId/version", upload.single("file"), async (req, res) => {
  try {
    const version = await Version.create({
      project: req.params.projectId,
      uploader: req.user._id,
      fileUrl: `/uploads/${req.file.filename}`,
      note: req.body.note,
    });
    res.json(version);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:projectId/versions", async (req, res) => {
  const versions = await Version.find({ project: req.params.projectId }).populate(
    "uploader",
    "name"
  );
  res.json(versions);
});
// Authenticated Routes (require a valid JWT)
// Applying verifyJWT middleware to all routes that modify project data
router.post("/", verifyJWT, createProject);
router.patch("/:projectId", verifyJWT, updateProject);
router.delete("/:projectId", verifyJWT, deleteProject);

export default router;
