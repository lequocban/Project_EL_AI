const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const v1Routes = require("./api/v1/routes/index");
const { errorHandler } = require("./utils/errorHandler");
const { verifyToken } = require("./api/v1/middlewares/auth.middleware");

const app = express();

// Security headers
app.use(helmet());

// CORS — cho phép mọi origin truy cập API (cấu hình origin cụ thể trong production)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verify token cho tất cả API (để có thể dùng req.user, req.accessToken)
app.use(verifyToken);

// API routes
app.use("/api/v1", v1Routes);

// Global error handler (phải đặt cuối cùng)
app.use(errorHandler);

module.exports = app;

