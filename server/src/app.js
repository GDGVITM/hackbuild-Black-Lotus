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

import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import projectRoutes from "./routes/project.routes.js";
import proposalRoutes from "./routes/proposal.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import contractRoutes from "./routes/contract.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/proposals", proposalRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/contracts", contractRoutes);

io.on("connection", (socket) => {
  console.log(`Socket.IO client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket.IO client disconnected: ${socket.id}`);
  });
});

export { httpServer };
