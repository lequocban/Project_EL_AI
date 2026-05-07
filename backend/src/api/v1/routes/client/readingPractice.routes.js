const router = require("express").Router();
const readingPracticeController = require("../../controllers/client/readingPractice.controller");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");
const { validateBody } = require("../../validations/validate");
const { submitReadingPracticeSchema } = require("../../validations/readingPractice.validation");

/**
 * POST /api/v1/reading-lessons/:lessonId/practice/submit
 * Nộp bài luyện đọc.
 */
router.post(
  "/:lessonId/practice/submit",
  verifyToken,
  requireAuth,
  validateBody(submitReadingPracticeSchema),
  readingPracticeController.submitReadingPractice
);

/**
 * GET /api/v1/reading-lessons/practice/history
 * Lấy lịch sử luyện đọc của user (có phân trang).
 */
router.get(
  "/practice/history",
  verifyToken,
  requireAuth,
  readingPracticeController.getPracticeHistory
);

/**
 * GET /api/v1/reading-lessons/practice/:practiceId
 * Lấy chi tiết một bài luyện đọc đã làm.
 */
router.get(
  "/practice/:practiceId",
  verifyToken,
  requireAuth,
  readingPracticeController.getPracticeDetail
);

module.exports = router;
