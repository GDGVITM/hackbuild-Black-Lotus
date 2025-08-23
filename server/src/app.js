import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import the Message model to save messages to the database
import { Message } from "./models/message.model.js";

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.set("io", io);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// --- ROUTE IMPORTS ---
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import projectRoutes from "./routes/project.routes.js";
import proposalRoutes from "./routes/proposal.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import contractRoutes from "./routes/contract.routes.js";

// --- ROUTE DECLARATIONS ---
app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/proposals", proposalRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/contracts", contractRoutes);

// --- SOCKET.IO LOGIC ---
io.on("connection", (socket) => {
  console.log(`Socket.IO client connected: ${socket.id}`);

  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room ${conversationId}`);
  });

  socket.on("sendMessage", async (data) => {
    const { conversationId, senderId, content } = data;

    if (!conversationId || !senderId || !content) {
      // Handle error: emit an error event back to the sender
      socket.emit("chatError", { message: "Missing data for sending message." });
      return;
    }

    try {
      // 1. Save the message to the database
      const message = new Message({
        conversation: conversationId,
        sender: senderId,
        content: content,
      });
      await message.save();

      // 2. Broadcast the message to all clients in the room
      io.to(conversationId).emit("newMessage", message);
    } catch (error) {
      console.error("Error saving or broadcasting message:", error);
      socket.emit("chatError", { message: "Could not send message." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket.IO client disconnected: ${socket.id}`);
  });
});

export { httpServer };
