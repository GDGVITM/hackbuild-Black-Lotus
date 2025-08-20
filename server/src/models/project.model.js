import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUser",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
      index: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
    },
    proposals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Proposal",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);
