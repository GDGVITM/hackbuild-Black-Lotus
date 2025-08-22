import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Payment } from "../models/payment.model.js";
import { logPaymentToBlockchain } from "../utils/blockchain.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt = `receipt_${Date.now()}` } = req.body;

  if (!amount) throw new ApiError(400, "Amount is required");

  const options = {
    amount: amount * 100,
    currency,
    receipt,
  };

  const order = await razorpay.orders.create(options);

  if (!order) throw new ApiError(500, "Failed to create Razorpay order");

  res.status(200).json(new ApiResponse(200, "Order created successfully", order));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount || !currency) {
    throw new ApiError(400, "All payment verification fields are required.");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid signature. Payment verification failed.");
  }

  const blockchainTxHash = await logPaymentToBlockchain({
    razorpay_order_id,
    razorpay_payment_id,
    amount,
    currency,
  });

  const payment = await Payment.create({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    currency,
    user: req.user?._id,
    status: "paid",
    blockchain_tx_hash: blockchainTxHash,
  });

  const populatedPayment = await payment.populate("user", "fullName email avatar");

  const io = req.app.get("io");
  io.emit("new_payment", populatedPayment);

  res.status(200).json(
    new ApiResponse(200, "Payment verified and logged successfully", {
      isVerified: true,
      razorpay_payment_id,
      dbId: payment._id,
      blockchainTxHash,
    })
  );
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate("user", "fullName email avatar")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, "Payments retrieved", payments));
});
