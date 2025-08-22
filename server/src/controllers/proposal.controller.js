import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Proposal } from "../models/proposal.model.js";
import { Project } from "../models/project.model.js";
import mongoose, { Schema } from "mongoose";

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

  const proposal = await Proposal.create({
    student: student._id,
    project: projectId,
    coverLetter,
    proposedRate,
    estimatedTimeline,
  });

  project.proposals.push(proposal._id);
  await project.save();

  return res.status(201).json(new ApiResponse(201, "Proposal submitted successfully", proposal));
});

const getProposalsForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view proposals for this project");
  }

  const proposals = await Proposal.find({ project: projectId }).populate(
    "student",
    "fullname avatar skills"
  );

  return res.status(200).json(new ApiResponse(200, "Proposals fetched successfully", proposals));
});

const getProposalsByStudent = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const proposals = await Proposal.find({ student: studentId }).populate("project", "title status");

  return res
    .status(200)
    .json(new ApiResponse(200, "Your proposals fetched successfully", proposals));
});

const updateProposalStatus = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    throw new ApiError(400, "Invalid proposal ID");
  }

  const proposal = await Proposal.findById(proposalId);
  if (!proposal) {
    throw new ApiError(404, "Proposal not found");
  }

  const project = await Project.findById(proposal.project);
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this proposal");
  }

  proposal.status = status;
  await proposal.save({ validateBeforeSave: false });

  if (status === "accepted") {
    project.status = "in-progress";
    await project.save({ validateBeforeSave: false });
  }

  return res.status(200).json(new ApiResponse(200, `Proposal has been ${status}`, proposal));
});

const withdrawProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    throw new ApiError(400, "Invalid proposal ID");
  }

  const proposal = await Proposal.findById(proposalId);
  if (!proposal) {
    throw new ApiError(404, "Proposal not found");
  }

  if (proposal.student.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to withdraw this proposal");
  }

  await Project.findByIdAndUpdate(proposal.project, {
    $pull: { proposals: proposalId },
  });

  await Proposal.findByIdAndDelete(proposalId);

  return res.status(200).json(new ApiResponse(200, "Proposal withdrawn successfully", {}));
});

export {
  createProposal,
  getProposalsForProject,
  getProposalsByStudent,
  updateProposalStatus,
  withdrawProposal,
};
