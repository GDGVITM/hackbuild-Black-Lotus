import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Contract } from "../models/contract.model.js";
import { Proposal } from "../models/proposal.model.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";

const createContract = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const { terms, milestones } = req.body;
  const client = req.user;

  if (!mongoose.Types.ObjectId.isValid(proposalId)) {
    throw new ApiError("Invalid proposal ID", 400);
  }

  if (!terms || !milestones || milestones.length === 0) {
    throw new ApiError("Terms and at least one milestone are required", 400);
  }

  const proposal = await Proposal.findById(proposalId);
  if (!proposal || proposal.status !== "accepted") {
    throw new ApiError("Proposal not found or not accepted", 404);
  }

  const project = await Project.findById(proposal.project);
  if (project.client.toString() !== client._id.toString()) {
    throw new ApiError("You are not authorized to create a contract for this project", 403);
  }

  const totalValue = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  if (totalValue !== project.budget) {
    throw new ApiError("Total milestone amounts must equal the project budget", 400);
  }

  const contract = await Contract.create({
    client: client._id,
    student: proposal.student,
    project: proposal.project,
    terms,
    totalValue,
    milestones,
  });

  return res.status(201).json(new ApiResponse(201, "Contract created successfully", contract));
});

const getContractById = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new ApiError("Invalid contract ID", 400);
  }

  const contract = await Contract.findById(contractId)
    .populate("client", "fullname avatar")
    .populate("student", "fullname avatar");

  if (!contract) {
    throw new ApiError("Contract not found", 404);
  }

  if (
    contract.client._id.toString() !== user._id.toString() &&
    contract.student._id.toString() !== user._id.toString()
  ) {
    throw new ApiError("You are not authorized to view this contract", 403);
  }

  return res.status(200).json(new ApiResponse(200, "Contract fetched successfully", contract));
});

const getUserContracts = asyncHandler(async (req, res) => {
  const user = req.user;

  const contracts = await Contract.find({
    $or: [{ client: user._id }, { student: user._id }],
  })
    .populate("project", "title")
    .populate("client", "fullname")
    .populate("student", "fullname");

  return res
    .status(200)
    .json(new ApiResponse(200, "User contracts fetched successfully", contracts));
});

const updateMilestoneStatus = asyncHandler(async (req, res) => {
  const { contractId, milestoneId } = req.params;
  const { status } = req.body;
  const user = req.user;

  if (
    !mongoose.Types.ObjectId.isValid(contractId) ||
    !mongoose.Types.ObjectId.isValid(milestoneId)
  ) {
    throw new ApiError("Invalid ID provided", 400);
  }

  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new ApiError("Contract not found", 404);
  }

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError("Milestone not found", 404);
  }

  if (status === "submitted" && contract.student.toString() === user._id.toString()) {
    milestone.status = "submitted";
  } else if (status === "approved" && contract.client.toString() === user._id.toString()) {
    milestone.status = "approved";
  } else {
    throw new ApiError("Invalid status update or unauthorized", 403);
  }

  await contract.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, "Milestone status updated", contract));
});

const fundEscrow = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const client = req.user;

  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new ApiError("Invalid contract ID", 400);
  }

  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new ApiError("Contract not found", 404);
  }

  if (contract.client.toString() !== client._id.toString()) {
    throw new ApiError("Only the client can fund the escrow", 403);
  }

  contract.escrowStatus = "held";
  await contract.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, "Escrow funded successfully", contract));
});

export { createContract, getContractById, getUserContracts, updateMilestoneStatus, fundEscrow };
