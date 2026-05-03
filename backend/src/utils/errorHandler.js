const env = require("../config/env.config");

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const isProduction = env.nodeEnv === "production";

  // Trong production: ẩn message của lỗi 500 để tránh leak thông tin nội bộ
  const message =
    status === 500 && isProduction
      ? "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau"
      : err.message || "Internal Server Error";

  const response = {
    code: status,
    success: false,
    message,
  };

  // Đính kèm danh sách lỗi validation nếu có (từ validate.js)
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  res.status(status).json(response);
};

module.exports = { errorHandler };

