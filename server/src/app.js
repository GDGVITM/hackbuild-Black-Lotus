import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import chatRoutes1 from "./routes/chat1.routes.js";
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import projectRoutes from "./routes/project.routes.js";
import proposalRoutes from "./routes/proposal.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import contractRoutes from "./routes/contract.routes.js";

import Message from "./models/message.model.js"; // ✅ Don't forget this

// ──────────────────────────────────────
// APP & SERVER SETUP
// ──────────────────────────────────────

const app = express();
const httpServer = createServer(app);

// ──────────────────────────────────────
// SOCKET.IO SETUP
// ──────────────────────────────────────

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  // Join Room
  socket.on("joinRoom", ({ chatRoomId }) => {
    socket.join(chatRoomId);
    console.log(`👤 User joined room: ${chatRoomId}`);
  });

  // Send & Broadcast Message
  socket.on("sendMessage", async ({ chatRoomId, senderId, message }) => {
    try {
      const newMessage = await Message.create({
        chatRoom: chatRoomId,
        sender: senderId,
        text: message,
      });

      io.to(chatRoomId).emit("receiveMessage", {
        chatRoomId,
        senderId,
        message,
        timestamp: newMessage.timestamp,
      });
    } catch (err) {
      console.error("❌ Message save error:", err);
    }
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Allow access to `io` in other middlewares/controllers
app.set("io", io);

// ──────────────────────────────────────
// PEERJS SETUP (if you're using WebRTC)
// ──────────────────────────────────────

const peerServer = ExpressPeerServer(httpServer, { debug: true });
app.use("/peerjs", peerServer);

// ──────────────────────────────────────
// MIDDLEWARES
// ──────────────────────────────────────

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

// ──────────────────────────────────────
// ROUTES
// ──────────────────────────────────────

app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/proposals", proposalRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/contracts", contractRoutes);
app.use("/api/v1/chat1", chatRoutes1);

// ──────────────────────────────────────
// EXPORT HTTP SERVER
// ──────────────────────────────────────

export { httpServer };
