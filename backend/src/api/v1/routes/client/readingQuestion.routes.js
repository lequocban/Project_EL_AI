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

module.exports = router;
