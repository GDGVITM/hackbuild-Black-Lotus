import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";

const createProject = asyncHandler(async (req, res) => {
  const { title, description, skillsRequired, budget, deadline } = req.body;

  if (
    [title, description, budget].some(
      (field) => !field || (typeof field === "string" && field.trim() === "")
    )
  ) {
    throw new ApiError("Title, description, and budget are required", 400);
  }

  if (!skillsRequired || skillsRequired.length === 0) {
    throw new ApiError("At least one skill is required", 400);
  }

  const client = req.user;

  // Updated role check to "business" to align with the BusinessUser model
  if (client.role !== "business") {
    throw new ApiError("Only business users can post projects", 403);
  }

  const project = await Project.create({
    client: client._id,
    title,
    description,
    skillsRequired,
    budget,
    deadline,
  });

  if (!project) {
    throw new ApiError("Failed to create the project", 500);
  }

  return res.status(201).json(new ApiResponse(201, "Project created successfully", project));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError("Invalid project ID", 400);
  }

  const project = await Project.findById(projectId).populate("client", "fullname avatar");

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  return res.status(200).json(new ApiResponse(200, "Project fetched successfully", project));
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, skillsRequired, budget, deadline, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError("Invalid project ID", 400);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not authorized to update this project", 403);
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        title,
        description,
        skillsRequired,
        budget,
        deadline,
        status,
      },
    },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, "Project updated successfully", updatedProject));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError("Invalid project ID", 400);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not authorized to delete this project", 403);
  }

  await Project.findByIdAndDelete(projectId);

  return res.status(200).json(new ApiResponse(200, "Project deleted successfully", {}));
});

const getAllProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc" } = req.query;

  const filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { skillsRequired: { $in: [new RegExp(query, "i")] } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortType === "asc" ? 1 : -1;

  const projects = await Project.find(filter)
    .populate("client", "fullname avatar")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalProjects = await Project.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, "Projects fetched successfully", {
      projects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: parseInt(page),
    })
  );
});

const getProjectsByClient = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ApiError("Invalid client ID", 400);
  }

  const projects = await Project.find({ client: clientId });

  if (!projects) {
    throw new ApiError("No projects found for this client", 404);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Client projects fetched successfully", projects));
});

export {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectsByClient,
};
