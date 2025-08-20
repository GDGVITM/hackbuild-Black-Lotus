import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { StudentUser } from "../models/studentUser.model.js";
import { BusinessUser } from "../models/businessUser.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get the token from either cookies or the Authorization header.
    const token =
      req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer", "").trim();

    if (!token) {
      throw new ApiError("Access token is missing or invalid", 401);
    }

    // 2. Decode the token to access its payload.
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Check the 'role' claim from the decoded token to determine the user type.
    const userRole = decodedToken?.role;

    let user;

    // 4. Based on the role, query the correct user model.
    if (userRole === "student") {
      user = await StudentUser.findById(decodedToken?._id).select("-password -refreshToken");
    } else if (userRole === "business") {
      user = await BusinessUser.findById(decodedToken?._id).select("-password -refreshToken");
    } else {
      // If the role is missing or invalid, throw an error.
      throw new ApiError("Invalid user role in token", 401);
    }

    if (!user) {
      throw new ApiError("User not found for the provided access token", 401);
    }

    // 5. Attach the found user object to the request for use in subsequent controllers.
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(error.message || "Access token is invalid or expired", 401);
  }
});
