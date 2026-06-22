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

/**
 * Rate limiter cho endpoint gửi OTP.
 * Max 3 lần / 10 phút mỗi IP.
 * Email được gửi từ backend, cần giới hạn chặt để tránh spam.
 */
const requestOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    success: false,
    message: "Quá nhiều yêu cầu gửi OTP. Vui lòng thử lại sau 10 phút.",
  },
});

/**
 * Rate limiter cho endpoint xác thực OTP / đặt lại mật khẩu.
 * Max 5 lần / 15 phút mỗi IP.
 * Ngăn brute-force mã OTP.
 */
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    success: false,
    message: "Quá nhiều lần xác thực OTP. Vui lòng thử lại sau 15 phút.",
  },
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter cho endpoint gửi OTP đăng ký tài khoản.
 * Max 3 lần / 10 phút mỗi IP.
 * Ngăn spam gửi email OTP đăng ký.
 */
const registerOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    success: false,
    message: "Quá nhiều yêu cầu gửi OTP đăng ký. Vui lòng thử lại sau 10 phút.",
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  registerOtpLimiter,
  requestOtpLimiter,
  resetPasswordLimiter,
};
