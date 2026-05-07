const router = require("express").Router();
const readingLessonController = require("../../controllers/client/readingLesson.controller");
const {
  createReadingLessonSchema,
  updateReadingLessonSchema,
} = require("../../validations/readingLesson.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

// POST /api/v1/reading-lessons — Tạo bài luyện đọc mới
router.post(
  "/",
  verifyToken,
  requireAuth,
  validateBody(createReadingLessonSchema),
  readingLessonController.createLesson
);

// GET /api/v1/reading-lessons/my — Danh sách bài luyện đọc của user (phân trang, tìm kiếm)
router.get(
  "/my",
  verifyToken,
  requireAuth,
  readingLessonController.getMyLessons
);

// GET /api/v1/reading-lessons/public — Danh sách bài luyện đọc public (phân trang, tìm kiếm)
router.get(
  "/public",
  verifyToken,
  requireAuth,
  readingLessonController.getPublicLessons
);

// GET /api/v1/reading-lessons/:id — Chi tiết bài luyện đọc
router.get(
  "/:id",
  verifyToken,
  requireAuth,
  readingLessonController.getDetail
);

// PATCH /api/v1/reading-lessons/:id — Cập nhật bài luyện đọc
router.patch(
  "/:id",
  verifyToken,
  requireAuth,
  validateBody(updateReadingLessonSchema),
  readingLessonController.updateLesson
);

// DELETE /api/v1/reading-lessons/:id — Xóa bài luyện đọc (xóa mềm)
router.delete(
  "/:id",
  verifyToken,
  requireAuth,
  readingLessonController.removeLesson
);

// POST /api/v1/reading-lessons/:id/request-public — Yêu cầu public bài luyện đọc
router.post(
  "/:id/request-public",
  verifyToken,
  requireAuth,
  readingLessonController.requestPublic
);

module.exports = router;
