const router = require("express").Router();
const readingLessonAdminController = require("../../controllers/admin/readingLesson.controller");
const { verifyToken, requireAuth, requireManagerOrAdmin } = require("../../middlewares/auth.middleware");

// GET /api/v1/admin/reading-lessons/pending — Danh sách bài chờ duyệt public
router.get(
  "/reading-lessons/pending",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  readingLessonAdminController.getPendingPublic
);

// POST /api/v1/admin/reading-lessons/:id/approve — Duyệt public bài luyện đọc
router.post(
  "/reading-lessons/:id/approve",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  readingLessonAdminController.approvePublic
);

// POST /api/v1/admin/reading-lessons/:id/reject — Từ chối duyệt public bài luyện đọc
router.post(
  "/reading-lessons/:id/reject",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  readingLessonAdminController.rejectPublic
);

module.exports = router;
