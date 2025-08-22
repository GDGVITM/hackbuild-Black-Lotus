import { Router } from "express";
import {
  registerStudent,
  registerClient,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateCurrentUser,
  getUserProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Routes
// Separate registration routes for students and clients
router.post("/register/student", upload.single("avatar"), registerStudent);
router.post("/register/client", upload.single("avatar"), registerClient);

router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// Authenticated Routes (require a valid JWT)
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/me", verifyJWT, updateCurrentUser);

// This route can remain public or be protected depending on your app's logic
router.get("/profile/:email", getUserProfile);

export default router;
