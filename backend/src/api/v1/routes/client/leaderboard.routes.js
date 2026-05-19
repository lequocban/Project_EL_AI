const router = require("express").Router();
const leaderboardController = require("../../controllers/client/leaderboard.controller");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

router.use(verifyToken, requireAuth);

/**
 * GET /api/v1/leaderboard
 * Bảng xếp hạng tổng (gộp cả 3 kỹ năng)
 * Query params: page, limit
 */
router.get("/", leaderboardController.getLeaderboard);

/**
 * GET /api/v1/leaderboard/by-skill
 * Bảng xếp hạng theo kỹ năng cụ thể
 * Query params: skill (vocabulary|reading|listening), page, limit
 * VD: /api/v1/leaderboard/by-skill?skill=vocabulary&page=1&limit=10
 */
router.get("/by-skill", leaderboardController.getLeaderboardBySkill);

module.exports = router;
