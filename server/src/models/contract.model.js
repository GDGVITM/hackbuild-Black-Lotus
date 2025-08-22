import mongoose, { Schema } from "mongoose";

const milestoneSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "submitted", "approved", "paid"],
    default: "pending",
  },
});

const contractSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    terms: {
      type: String,
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    milestones: [milestoneSchema],
    status: {
      type: String,
      enum: ["active", "completed", "in-dispute", "terminated"],
      default: "active",
    },
    escrowStatus: {
      type: String,
      enum: ["complete", "held"],
      default: "held",
    },
  },
  {
    timestamps: true,
  }
);

export const Contract = mongoose.model("Contract", contractSchema);
