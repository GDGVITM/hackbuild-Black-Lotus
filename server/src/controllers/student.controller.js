import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { StudentUser } from "../models/studentUser.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// This function generates and saves access and refresh tokens for a user.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const student = await StudentUser.findById(userId);
    if (!student) {
      throw new ApiError("Student not found", 404);
    }

    const accessToken = student.generateAuthToken();
    const refreshToken = student.generateRefreshToken();
    student.refreshToken = refreshToken;
    await student.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError("Something went wrong while generating tokens", 500);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, fullname, password } = req.body;

  if ([email, fullname, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError("Please provide email, fullname, and password", 400);
  }

  const existingStudent = await StudentUser.findOne({ email });

  if (existingStudent) {
    throw new ApiError("Student with this email already exists", 409);
  }

  // --- FIX START ---
  // Initialize the avatar path and URL as null.
  // We will only proceed with avatar upload if a file is provided.
  const avatarLocalPath = req.file?.path;
  let avatarUrl = null;

  // Check if an avatar file was uploaded.
  if (avatarLocalPath) {
    const avatarResult = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarResult || !avatarResult.url) {
      // If upload fails, throw an error. This is a server-side issue.
      throw new ApiError("Avatar upload failed, please try again", 500);
    }
    // If upload is successful, store the URL.
    avatarUrl = avatarResult.url;
  }
  // If no file was uploaded, avatarUrl remains null, which is what we want.
  // --- FIX END ---

  const student = await StudentUser.create({
    fullname,
    email: email.toLowerCase(),
    password,
    avatar: avatarUrl, // Use the conditional avatarUrl
  });

  const createdStudent = await StudentUser.findById(student._id).select("-password -refreshToken");

  if (!createdStudent) {
    throw new ApiError("Student registration failed", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Student registered successfully", createdStudent));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("Please provide email and password", 400);
  }

  const student = await StudentUser.findOne({ email });

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  const isPassValid = await student.isPasswordCorrect(password);

  if (!isPassValid) {
    throw new ApiError("Invalid credentials", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id);

  const loggedInStudent = await StudentUser.findById(student._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Student logged in successfully", {
        user: loggedInStudent,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await StudentUser.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Student logged out successfully", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized request", 401);
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const student = await StudentUser.findById(decodedToken?._id);

    if (!student) {
      throw new ApiError("Invalid refresh token", 401);
    }

    if (incomingRefreshToken !== student.refreshToken) {
      throw new ApiError("Refresh token is expired or used", 401);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", { accessToken, refreshToken })
      );
  } catch (error) {
    throw new ApiError("Invalid refresh token", 401);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const student = await StudentUser.findById(req.user._id);

  const isPasswordCorrect = await student.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError("Invalid old password", 400);
  }

  student.password = newPassword;
  await student.save({ validateBeforeSave: true });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current student fetched successfully"));
});

const updateUserProfileDetails = asyncHandler(async (req, res) => {
  const { fullname, headline, bio, skills, hourlyRate, portfolioLinks, educationDetails } =
    req.body;

  const updatedStudent = await StudentUser.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        headline,
        bio,
        skills,
        hourlyRate,
        portfolioLinks,
        educationDetails,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Student profile updated successfully", updatedStudent));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar file is missing", 400);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError("Error while uploading avatar", 500);
  }

  const student = await StudentUser.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, "Avatar image updated successfully", student));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError("User ID is required", 400);
  }

  const student = await StudentUser.findById(userId).select("-password -refreshToken");

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Student profile fetched successfully", student));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserProfileDetails,
  updateUserAvatar,
  getUserProfile,
};
