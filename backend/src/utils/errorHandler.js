const env = require("../config/env.config");

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const isProduction = env.nodeEnv === "production";

  let message = err.message;
  if (!message || message.trim() === "") {
    message = "Internal Server Error";
  } else if (status === 500 && isProduction) {
    message = "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau";
  }

  const response = {
    code: status,
    success: false,
    message,
  };

  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  res.status(status).json(response);
};

module.exports = { errorHandler };

