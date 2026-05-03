const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { registerSchema, loginSchema } = require("../validations/auth.validation");
const { validateBody } = require("../validations/validate");
const { loginLimiter, registerLimiter } = require("../middlewares/rate-limit.middleware");

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

module.exports = router;

