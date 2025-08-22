import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Proposal } from "../models/proposal.model.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";

const createProposal = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { coverLetter, proposedRate, estimatedTimeline } = req.body;
  const student = req.user;

  if (student.role !== "student") {
    throw new ApiError(403, "Only students can submit proposals");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  if ([coverLetter, proposedRate, estimatedTimeline].some((field) => !field)) {
    throw new ApiError(400, "All fields are required");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const existingProposal = await Proposal.findOne({ student: student._id, project: projectId });
  if (existingProposal) {
    throw new ApiError(409, "You have already submitted a proposal for this project");
  }

  // ✅ 1. Create Proposal
  const proposal = await Proposal.create({
    student: student._id,
    project: projectId,
    coverLetter,
    proposedRate,
    estimatedTimeline,
  });

  project.proposals.push(proposal._id);
  await project.save();

  // ✅ 2. Create Chat Room with student and client
  const chatRoom = await ChatRoom.create({
    proposal: proposal._id,
    participants: [student._id, project.client],
  });

  project.proposals.push(proposal._id);
  await project.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        proposal,
        chatRoomId: chatRoom._id,
      },
      "Proposal submitted successfully"
    )
  );
});

const getProposalsForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError("Invalid project ID", 400);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not authorized to view proposals for this project", 403);
  }

  const proposals = await Proposal.find({ project: projectId }).populate(
    "student",
    "fullname avatar skills"
  );

  return res.status(200).json(new ApiResponse(200, proposals, "Proposals fetched successfully"));
});

const getProposalsByStudent = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const proposals = await Proposal.find({ student: studentId }).populate("project", "title status");

  return res
    .status(200)
    .json(new ApiResponse(200, proposals, "Your proposals fetched successfully"));
});

const updateProposalStatus = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    throw new ApiError("Invalid status", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    throw new ApiError("Invalid proposal ID", 400);
  }

  const proposal = await Proposal.findById(proposalId);
  if (!proposal) {
    throw new ApiError("Proposal not found", 404);
  }

  const project = await Project.findById(proposal.project);
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not authorized to update this proposal", 403);
  }

  proposal.status = status;
  await proposal.save({ validateBeforeSave: false });

  if (status === "accepted") {
    project.status = "in-progress";
    await project.save({ validateBeforeSave: false });
  }

  return res.status(200).json(new ApiResponse(200, proposal, `Proposal has been ${status}`));
});

const withdrawProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    throw new ApiError("Invalid proposal ID", 400);
  }

  const proposal = await Proposal.findById(proposalId);
  if (!proposal) {
    throw new ApiError("Proposal not found", 404);
  }

  if (proposal.student.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not authorized to withdraw this proposal", 403);
  }

  await Project.findByIdAndUpdate(proposal.project, {
    $pull: { proposals: proposalId },
  });

  await Proposal.findByIdAndDelete(proposalId);

  return res.status(200).json(new ApiResponse(200, {}, "Proposal withdrawn successfully"));
});

export {
  createProposal,
  getProposalsForProject,
  getProposalsByStudent,
  updateProposalStatus,
  withdrawProposal,
};
