const router = require("express").Router();
const readingQuestionController = require("../../controllers/client/readingQuestion.controller");
const {
  updateQuestionSchema,
  deleteManyQuestionsSchema,
} = require("../../validations/readingQuestion.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

// DELETE /api/v1/reading-questions/bulk — Xóa nhiều câu hỏi
router.delete(
  "/bulk",
  verifyToken,
  requireAuth,
  validateBody(deleteManyQuestionsSchema),
  readingQuestionController.deleteManyQuestions
);

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

module.exports = router;
