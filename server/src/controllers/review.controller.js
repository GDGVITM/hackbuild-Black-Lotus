import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Review } from "../models/review.model.js";
import { Contract } from "../models/contract.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const createReview = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const { rating, comment } = req.body;
  const reviewer = req.user;

  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new ApiError("Invalid contract ID", 400);
  }

  if (!rating) {
    throw new ApiError("Rating is required", 400);
  }

  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new ApiError("Contract not found", 404);
  }

  if (contract.status !== "completed") {
    throw new ApiError("Reviews can only be left for completed contracts", 403);
  }

  const isClient = contract.client.toString() === reviewer._id.toString();
  const isStudent = contract.student.toString() === reviewer._id.toString();

  if (!isClient && !isStudent) {
    throw new ApiError("You are not part of this contract", 403);
  }

  const revieweeId = isClient ? contract.student : contract.client;
  const reviewType = isClient ? "client-to-student" : "student-to-client";

  const existingReview = await Review.findOne({
    reviewer: reviewer._id,
    project: contract.project,
  });

  if (existingReview) {
    throw new ApiError("You have already reviewed this project", 409);
  }

  const review = await Review.create({
    reviewer: reviewer._id,
    reviewee: revieweeId,
    project: contract.project,
    rating,
    comment,
    type: reviewType,
  });

  const stats = await Review.aggregate([
    { $match: { reviewee: revieweeId } },
    { $group: { _id: "$reviewee", avgRating: { $avg: "$rating" } } },
  ]);

  if (stats.length > 0) {
    const avgRating = stats[0].avgRating.toFixed(1);
    await User.findByIdAndUpdate(revieweeId, { averageRating: avgRating });
  }

  return res.status(201).json(new ApiResponse(201, "Review submitted successfully", review));
});

const getReviewsForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError("Invalid project ID", 400);
  }

  const reviews = await Review.find({ project: projectId }).populate("reviewer", "fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, "Project reviews fetched successfully", reviews));
});

const getReviewsForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const reviews = await Review.find({ reviewee: userId })
    .populate("reviewer", "fullname avatar")
    .populate("project", "title");

  return res.status(200).json(new ApiResponse(200, "User reviews fetched successfully", reviews));
});

export { createReview, getReviewsForProject, getReviewsForUser };
