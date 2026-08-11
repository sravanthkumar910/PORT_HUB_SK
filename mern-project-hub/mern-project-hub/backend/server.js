// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import compression from "compression";
// import rateLimit from "express-rate-limit";
// import connectDB from "./config/db.js";
// import { notFound, errorHandler } from "./middleware/errorHandler.js";

// import authRoutes from "./routes/authRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import ideaRoutes from "./routes/ideaRoutes.js";
// import projectRoutes from "./routes/projectRoutes.js";
// import projectStoreRoutes from "./routes/projectStoreRoutes.js";
// import taskRoutes from "./routes/taskRoutes.js";
// import documentRoutes from "./routes/documentRoutes.js";
// import profileRoutes from "./routes/profileRoutes.js";
// import integrationRoutes from "./routes/integrationRoutes.js";

// dotenv.config();
// connectDB();

// const app = express();
// const isProduction = process.env.NODE_ENV === "production";

// // Render/Railway/Heroku all sit behind a reverse proxy - needed for correct
// // client IPs (rate limiting) and secure cookies if you add them later.
// app.set("trust proxy", 1);

// // ---- Security & performance middleware ----
// app.use(helmet({ crossOriginResourcePolicy: false }));
// app.use(compression());

// // CORS: allow a comma-separated list of origins via CLIENT_URL so you can
// // list both your Vercel preview and production URLs, e.g.
// // CLIENT_URL=https://project-hub.vercel.app,https://project-hub-git-main.vercel.app
// const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
//   .split(",")
//   .map((s) => s.trim());

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // allow no-origin requests (curl, server-to-server, Postman)
//       if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
//       callback(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(morgan(isProduction ? "combined" : "dev"));

// // Rate limit auth endpoints specifically (brute-force protection)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 30,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { message: "Too many attempts, please try again later." },
// });
// app.use("/api/auth", authLimiter);

// // General API rate limit
// const apiLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   limit: 120,
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use("/api", apiLimiter);

// // ---- Health check (used by Render/Railway for readiness probes) ----
// app.get("/api/health", (req, res) =>
//   res.json({ status: "ok", env: process.env.NODE_ENV || "development", time: new Date().toISOString() })
// );

// // ---- Routes ----
// app.use("/api/auth", authRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/ideas", ideaRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/project-store", projectStoreRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/account", profileRoutes);
// app.use("/api/integrations", integrationRoutes);

// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Project Hub API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`));

// // Graceful shutdown (important on Render/Railway which send SIGTERM on redeploy)
// process.on("SIGTERM", () => {
//   console.log("SIGTERM received, shutting down gracefully");
//   process.exit(0);
// });

import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";

import { errorHandler, notFound } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import projectStoreRoutes from "./routes/projectStoreRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Connect MongoDB
connectDB();

// Trust proxy
app.set("trust proxy", 1);

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Compression
app.use(compression());

// CORS
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin
      // Example: Postman, curl, server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));

// Logging
app.use(morgan(isProduction ? "combined" : "dev"));

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts, please try again later.",
  },
});

app.use("/api/auth", authLimiter);

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/ideas", ideaRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/project-store", projectStoreRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/documents", documentRoutes);

app.use("/api/account", profileRoutes);

app.use("/api/integrations", integrationRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(
    `Project Hub API running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});