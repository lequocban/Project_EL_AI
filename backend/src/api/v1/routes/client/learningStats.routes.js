const router = require("express").Router();
const learningStatsController = require("../../controllers/client/learningStats.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");

/**
 * GET /api/v1/learning-stats
 * Lấy thống kê học tập của user hiện tại.
 * Yêu cầu đăng nhập.
 */
router.get("/", requireAuth, learningStatsController.getStats);

module.exports = router;
