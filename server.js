require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./src/models");

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const postRoutes = require("./src/routes/posts");
const commentRoutes = require("./src/routes/comments");
const likeRoutes = require("./src/routes/likes");
const friendRoutes = require("./src/routes/friends");
const timelineRoutes = require("./src/routes/timeline");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan("combined"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SocialMedia Backend API is running",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);
app.use("/api", friendRoutes);
app.use("/api/timeline", timelineRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synchronized successfully.");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Database: ${process.env.DB_NAME || "socialmedia"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  sequelize.close().then(() => {
    console.log("Database connection closed");
    process.exit(0);
  });
});

startServer();

module.exports = app;
