const router = require("express").Router();
const authController = require("../../controllers/client/auth.controller");
const {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../../validations/auth.validation");
const { validateBody } = require("../../validations/validate");
const { loginLimiter, registerLimiter } = require("../../middlewares/rate-limit.middleware");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

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
  validateBody(requestOtpSchema),
  authController.requestOtp
);

router.post(
  "/reset-password",
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
