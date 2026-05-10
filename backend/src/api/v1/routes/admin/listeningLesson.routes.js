const router = require("express").Router();
const listeningLessonAdminController = require("../../controllers/admin/listeningLesson.controller");
const { verifyToken, requireAuth, requireManagerOrAdmin } = require("../../middlewares/auth.middleware");

// GET /api/v1/admin/listening-lessons/pending — Danh sách bài chờ duyệt public
router.get(
  "/listening-lessons/pending",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  listeningLessonAdminController.getPendingPublic
);

// POST /api/v1/admin/listening-lessons/:id/approve — Duyệt public bài luyện nghe
router.post(
  "/listening-lessons/:id/approve",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  listeningLessonAdminController.approvePublic
);

// POST /api/v1/admin/listening-lessons/:id/reject — Từ chối duyệt public bài luyện nghe
router.post(
  "/listening-lessons/:id/reject",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  listeningLessonAdminController.rejectPublic
);

module.exports = router;
