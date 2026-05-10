const router = require("express").Router();
const authController = require("../../controllers/admin/auth.controller");
const { adminLoginSchema } = require("../../validations/auth.validation");
const { validateBody } = require("../../validations/validate");
const { loginLimiter } = require("../../middlewares/rate-limit.middleware");
const { verifyToken, requireAuth, requireManagerOrAdmin } = require("../../middlewares/auth.middleware");

// POST /api/v1/admin/auth/login — Đăng nhập trang admin
router.post(
  "/login",
  loginLimiter,
  validateBody(adminLoginSchema),
  authController.adminLogin
);

// GET /api/v1/admin/auth/me — Lấy thông tin admin hiện tại (kèm role)
router.get(
  "/me",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  authController.getMe
);

// POST /api/v1/admin/auth/logout — Đăng xuất khỏi trang admin
router.post("/logout", authController.adminLogout);

module.exports = router;
