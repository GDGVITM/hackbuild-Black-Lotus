import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    razorpay_order_id: {
      type: String,
      required: true,
      trim: true,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
      trim: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      enum: ["INR", "USD"], // Extend if needed
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockchain_tx_hash: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "held", "released", "disputed"],
      default: "created",
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);
