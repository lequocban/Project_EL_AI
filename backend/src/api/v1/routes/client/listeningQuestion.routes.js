const router = require("express").Router();
const listeningQuestionController = require("../../controllers/client/listeningQuestion.controller");
const {
  createQuestionSchema,
  createManyQuestionsSchema,
  updateQuestionSchema,
  deleteManyQuestionsSchema,
} = require("../../validations/listeningQuestion.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

// ========== Nested routes: /listening-lessons/:lessonId/questions ==========

// POST /api/v1/listening-lessons/:lessonId/questions — Tạo một câu hỏi cho lesson
router.post(
  "/:lessonId/questions",
  verifyToken,
  requireAuth,
  validateBody(createQuestionSchema),
  listeningQuestionController.createQuestion
);

// POST /api/v1/listening-lessons/:lessonId/questions/bulk — Tạo nhiều câu hỏi cho lesson
router.post(
  "/:lessonId/questions/bulk",
  verifyToken,
  requireAuth,
  validateBody(createManyQuestionsSchema),
  listeningQuestionController.createManyQuestions
);

// GET /api/v1/listening-lessons/:lessonId/questions — Lấy danh sách câu hỏi của lesson
router.get(
  "/:lessonId/questions",
  verifyToken,
  requireAuth,
  listeningQuestionController.getQuestionsByLesson
);

// ========== Standalone routes: /listening-questions ==========

// DELETE /api/v1/listening-questions/bulk — Xóa nhiều câu hỏi
// Lưu ý: route /bulk phải đặt TRƯỚC /:id vì Express match theo thứ tự
router.delete(
  "/bulk",
  verifyToken,
  requireAuth,
  validateBody(deleteManyQuestionsSchema),
  listeningQuestionController.deleteManyQuestions
);

// PATCH /api/v1/listening-questions/:id — Cập nhật câu hỏi
router.patch(
  "/:id",
  verifyToken,
  requireAuth,
  validateBody(updateQuestionSchema),
  listeningQuestionController.updateQuestion
);

// DELETE /api/v1/listening-questions/:id — Xóa một câu hỏi
router.delete(
  "/:id",
  verifyToken,
  requireAuth,
  listeningQuestionController.deleteQuestion
);

module.exports = router;
