const rateLimit = require("express-rate-limit");

/**
 * Rate limiter cho endpoint đăng nhập.
 * Max 10 lần / 15 phút mỗi IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    success: false,
    message: "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.",
  },
  skipSuccessfulRequests: true, // Không tính request thành công vào quota
});

/**
 * Rate limiter cho endpoint đăng ký.
 * Max 5 lần / 60 phút mỗi IP.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 phút
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    success: false,
    message: "Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 giờ.",
  },
});

module.exports = { loginLimiter, registerLimiter };
