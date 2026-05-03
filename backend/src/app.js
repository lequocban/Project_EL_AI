const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const v1Routes = require("./api/v1/routes");
const { errorHandler } = require("./utils/errorHandler");

const app = express();

// Security headers
app.use(helmet());

// CORS — cho phép frontend gọi API (cấu hình origin cụ thể trong production)
app.use(cors());

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/v1", v1Routes);

// Global error handler (phải đặt cuối cùng)
app.use(errorHandler);

module.exports = app;

