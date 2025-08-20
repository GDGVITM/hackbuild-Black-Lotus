import mongoose, { Schema } from "mongoose";

const proposalSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    proposedRate: {
      type: Number,
      required: true,
    },
    estimatedTimeline: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "viewed", "accepted", "rejected"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

export const Proposal = mongoose.model("Proposal", proposalSchema);
