const router = require("express").Router();
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");
const moderationController = require("../../controllers/client/moderation.controller");

// POST /api/v1/moderation-requests — Tạo yêu cầu kiểm duyệt nội dung
router.post(
  "/",
  verifyToken,
  requireAuth,
  moderationController.createModerationRequest
);

// GET /api/v1/moderation-requests/my — Lấy danh sách yêu cầu kiểm duyệt của user
router.get(
  "/my",
  verifyToken,
  requireAuth,
  moderationController.getMyModerationRequests
);

module.exports = router;
