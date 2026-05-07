const router = require("express").Router();
const readingQuestionController = require("../../controllers/client/readingQuestion.controller");
const {
  createQuestionSchema,
  createManyQuestionsSchema,
  updateQuestionSchema,
  deleteManyQuestionsSchema,
} = require("../../validations/readingQuestion.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

// ============================================================
// Nested resource — nằm dưới /reading-lessons/:lessonId/questions
// ============================================================

// POST /api/v1/reading-lessons/:lessonId/questions — Tạo một câu hỏi cho lesson
router.post(
  "/:lessonId/questions",
  verifyToken,
  requireAuth,
  validateBody(createQuestionSchema),
  readingQuestionController.createQuestion
);

// POST /api/v1/reading-lessons/:lessonId/questions/bulk — Tạo nhiều câu hỏi cho lesson
router.post(
  "/:lessonId/questions/bulk",
  verifyToken,
  requireAuth,
  validateBody(createManyQuestionsSchema),
  readingQuestionController.createManyQuestions
);

// GET /api/v1/reading-lessons/:lessonId/questions — Lấy danh sách câu hỏi của lesson
router.get(
  "/:lessonId/questions",
  verifyToken,
  requireAuth,
  readingQuestionController.getQuestionsByLesson
);

// ============================================================
// Standalone resource — nằm dưới /reading-questions
// ============================================================

// PATCH /api/v1/reading-questions/:id — Cập nhật câu hỏi
router.patch(
  "/:id",
  verifyToken,
  requireAuth,
  validateBody(updateQuestionSchema),
  readingQuestionController.updateQuestion
);

// DELETE /api/v1/reading-questions/:id — Xóa một câu hỏi
router.delete(
  "/:id",
  verifyToken,
  requireAuth,
  readingQuestionController.deleteQuestion
);

// DELETE /api/v1/reading-questions/bulk — Xóa nhiều câu hỏi
router.delete(
  "/bulk",
  verifyToken,
  requireAuth,
  validateBody(deleteManyQuestionsSchema),
  readingQuestionController.deleteManyQuestions
);

module.exports = router;
