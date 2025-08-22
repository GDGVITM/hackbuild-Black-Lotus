import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw new ApiError("Something went wrong while generating tokens", 500);
  }
};

const registerStudent = asyncHandler(async (req, res) => {
  const { email, fullname, password, headline, bio, skills } = req.body;

  if ([email, fullname, password, headline].some((field) => !field || field.trim() === "")) {
    throw new ApiError("Please fill all the required fields", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError("User with this email already exists", 409);
  }

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError("Avatar image is required", 400);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError("Error while uploading avatar, please try again", 500);
  }

  const student = await User.create({
    fullname,
    email: email.toLowerCase(),
    password,
    headline,
    bio,
    skills: skills || [],
    avatar: avatar.url,
    role: "student",
  });

  const createdStudent = await User.findById(student._id).select("-password -refreshToken");

  if (!createdStudent) {
    throw new ApiError("Student registration failed, please try again.", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Student registered successfully", createdStudent));
});

const registerClient = asyncHandler(async (req, res) => {
  const { email, fullname, password, companyName } = req.body;

  if ([email, fullname, password, companyName].some((field) => !field || field.trim() === "")) {
    throw new ApiError("Please fill all the required fields", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError("User with this email already exists", 409);
  }

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError("Avatar image is required", 400);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError("Error while uploading avatar, please try again", 500);
  }

  const client = await User.create({
    fullname,
    email: email.toLowerCase(),
    password,
    companyName,
    avatar: avatar.url,
    role: "client",
  });

  const createdClient = await User.findById(client._id).select("-password -refreshToken");

  if (!createdClient) {
    throw new ApiError("Client registration failed, please try again.", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Client registered successfully", createdClient));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPassValid = await user.isPasswordCorrect(password);

  if (!isPassValid) {
    throw new ApiError("Invalid credentials", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized request", 401);
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError("Invalid refresh token", 401);
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError("Refresh token is expired or used", 401);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError("Invalid refresh token", 401);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError("Invalid old password", 400);
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const { fullname, email, ...otherDetails } = req.body;

  if (otherDetails.role) {
    delete otherDetails.role;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
        ...otherDetails,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "User details updated successfully", updatedUser));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    throw new ApiError("User email is required", 400);
  }

  const user = await User.findOne({ email }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return res.status(200).json(new ApiResponse(200, "User profile fetched successfully", user));
});

export {
  registerStudent,
  registerClient,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateCurrentUser,
  getUserProfile,
};
