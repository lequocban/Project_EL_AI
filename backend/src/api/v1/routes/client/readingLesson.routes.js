const router = require("express").Router();
const readingLessonController = require("../../controllers/client/readingLesson.controller");
const {
  generateWithAISchema,
  createReadingLessonSchema,
  updateReadingLessonSchema,
} = require("../../validations/readingLesson.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth, requireManagerOrAdmin } = require("../../middlewares/auth.middleware");

// POST /api/v1/reading-lessons/generate-with-ai — Tạo bài luyện đọc bằng AI
router.post(
  "/generate-with-ai",
  verifyToken,
  requireAuth,
  validateBody(generateWithAISchema),
  readingLessonController.generateWithAI
);

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

// POST /api/v1/reading-lessons/:id/make-private — Chuyển bài luyện đọc về chế độ riêng tư
router.post(
  "/:id/make-private",
  verifyToken,
  requireAuth,
  readingLessonController.makePrivate
);

// PATCH /api/v1/reading-lessons/:id/set-status — Thay đổi trạng thái bài luyện đọc (chỉ content_manager/admin, không cần kiểm duyệt)
router.patch(
  "/:id/set-status",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  readingLessonController.setStatus
);

module.exports = router;
