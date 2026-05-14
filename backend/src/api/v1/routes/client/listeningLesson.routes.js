const router = require("express").Router();
const listeningLessonController = require("../../controllers/client/listeningLesson.controller");
const generateListeningController = require("../../controllers/client/generateListening.controller");
const {
  createListeningLessonSchema,
  updateListeningLessonSchema,
} = require("../../validations/listeningLesson.validation");
const { createListeningByAISchema } = require("../../validations/generateListening.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth, requireManagerOrAdmin } = require("../../middlewares/auth.middleware");

// POST /api/v1/listening-lessons/generate-ai — Tạo bài luyện nghe bằng AI
router.post(
  "/generate-ai",
  verifyToken,
  requireAuth,
  validateBody(createListeningByAISchema),
  generateListeningController.generateListeningByAI
);

// POST /api/v1/listening-lessons — Tạo bài luyện nghe mới
router.post(
  "/",
  verifyToken,
  requireAuth,
  validateBody(createListeningLessonSchema),
  listeningLessonController.createLesson
);

// GET /api/v1/listening-lessons/my — Danh sách bài luyện nghe của user (phân trang, tìm kiếm)
router.get(
  "/my",
  verifyToken,
  requireAuth,
  listeningLessonController.getMyLessons
);

// GET /api/v1/listening-lessons/public — Danh sách bài luyện nghe public (phân trang, tìm kiếm)
router.get(
  "/public",
  verifyToken,
  requireAuth,
  listeningLessonController.getPublicLessons
);

// GET /api/v1/listening-lessons/:id — Chi tiết bài luyện nghe
router.get(
  "/:id",
  verifyToken,
  requireAuth,
  listeningLessonController.getDetail
);

// PATCH /api/v1/listening-lessons/:id — Cập nhật bài luyện nghe (không cho phép cập nhật status)
router.patch(
  "/:id",
  verifyToken,
  requireAuth,
  validateBody(updateListeningLessonSchema),
  listeningLessonController.updateLesson
);

// DELETE /api/v1/listening-lessons/:id — Xóa bài luyện nghe (xóa mềm)
router.delete(
  "/:id",
  verifyToken,
  requireAuth,
  listeningLessonController.removeLesson
);

// POST /api/v1/listening-lessons/:id/request-public — Yêu cầu public bài luyện nghe
router.post(
  "/:id/request-public",
  verifyToken,
  requireAuth,
  listeningLessonController.requestPublic
);

// POST /api/v1/listening-lessons/:id/make-private — Chuyển bài luyện nghe từ public thành private
router.post(
  "/:id/make-private",
  verifyToken,
  requireAuth,
  listeningLessonController.makePrivate
);

// PATCH /api/v1/listening-lessons/:id/set-status — Thay đổi trạng thái bài luyện nghe (chỉ content_manager/admin, không cần kiểm duyệt)
router.patch(
  "/:id/set-status",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  listeningLessonController.setStatus
);

module.exports = router;
