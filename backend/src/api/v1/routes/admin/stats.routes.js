const router = require("express").Router();
const statsController = require("../../controllers/admin/stats.controller");
const { verifyToken, requireAuth, requireAdmin } = require("../../middlewares/auth.middleware");

// GET /api/v1/admin/stats — Lấy toàn bộ thống kê hệ thống
router.get(
  "/",
  verifyToken,
  requireAuth,
  requireAdmin,
  statsController.getSystemStats
);

module.exports = router;
