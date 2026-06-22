const router = require("express").Router();
const authController = require("../../controllers/client/auth.controller");
const {
  registerOtpSchema,
  registerSchema,
  loginSchema,
  requestOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../../validations/auth.validation");
const { validateBody } = require("../../validations/validate");
const {
  loginLimiter,
  registerLimiter,
  registerOtpLimiter,
  requestOtpLimiter,
  resetPasswordLimiter,
} = require("../../middlewares/rate-limit.middleware");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

// Bước 1: Gửi OTP xác thực Email trước khi đăng ký
router.post(
  "/register/request-otp",
  registerOtpLimiter,
  validateBody(registerOtpSchema),
  authController.registerRequestOtp
);

// Bước 2: Hoàn tất đăng ký (email + otp + password + ...)
router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  authController.register
);

router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  authController.login
);

router.post("/logout", authController.logout);

router.post("/refresh-token", authController.refreshToken);

router.post(
  "/request-otp",
  requestOtpLimiter,
  validateBody(requestOtpSchema),
  authController.requestOtp
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

router.patch(
  "/change-password",
  verifyToken,
  requireAuth,
  validateBody(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
