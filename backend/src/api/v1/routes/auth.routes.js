const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { registerSchema, loginSchema, requestOtpSchema, resetPasswordSchema, changePasswordSchema } = require("../validations/auth.validation");
const { validateBody } = require("../validations/validate");
const { loginLimiter, registerLimiter } = require("../middlewares/rate-limit.middleware");
const { verifyToken, requireAuth } = require("../middlewares/auth.middleware");

// POST /api/v1/auth/register
router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  authController.register
);

// POST /api/v1/auth/login
router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  authController.login
);

// POST /api/v1/auth/logout  (cần Authorization: Bearer <token>)
router.post("/logout", authController.logout);

// POST /api/v1/auth/refresh-token  (body: { refreshToken })
router.post("/refresh-token", authController.refreshToken);

// POST /api/v1/auth/request-otp  (body: { email })
router.post(
  "/request-otp",
  validateBody(requestOtpSchema),
  authController.requestOtp
);

// POST /api/v1/auth/reset-password  (body: { email, otp, newPassword })
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// PATCH /api/v1/auth/change-password  (cần đăng nhập, body: { currentPassword, newPassword })
router.patch(
  "/change-password",
  verifyToken,
  requireAuth,
  validateBody(changePasswordSchema),
  authController.changePassword
);

module.exports = router;

