import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
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
app.use("/peerjs", peerServer);

// Existing route imports
import studentRoutes from "./routes/student.routes.js";
import businessRoutes from "./routes/business.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import agoraRouter from "./routes/agora.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import projectRouter from "./routes/project.routes.js";
import proposalRouter from "./routes/proposal.routes.js";
import contractRouter from "./routes/contract.routes.js";
import reviewRouter from "./routes/review.routes.js";

// New route imports for threads and topics
import threadRoutes from "./routes/thread.routes.js";
import topicRoutes from "./routes/topic.routes.js";

// Existing route mounting
app.use("/api/v1/users", studentRoutes);
app.use("/api/v1/users", businessRoutes);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/agora", agoraRouter);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/proposals", proposalRouter);
app.use("/api/v1/contracts", contractRouter);
app.use("/api/v1/reviews", reviewRouter);

// Mount the new routes for threads and topics
app.use("/api/v1/threads", threadRoutes);
app.use("/api/v1/topics", topicRoutes);

io.on("connection", (socket) => {
  console.log(`Socket.IO client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket.IO client disconnected: ${socket.id}`);
  });
});

export { httpServer };
