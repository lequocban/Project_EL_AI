const router = require("express").Router();
const practiceController = require("../../controllers/client/practice.controller");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");
const { validateBody } = require("../../validations/validate");
const { submitPracticeSchema } = require("../../validations/practice.validation");

/**
 * POST /api/v1/vocabulary-sets/practice/submit
 * Nộp bài luyện tập từ vựng.
 * type chỉ được phép: quiz, listening_quiz, translate_write, listen_write
 */
router.post(
  "/submit",
  verifyToken,
  requireAuth,
  validateBody(submitPracticeSchema),
  practiceController.submitPractice
);

/**
 * GET /api/v1/vocabulary-sets/practice/history
 * Lấy lịch sử luyện tập của user (có phân trang).
 */
router.get(
  "/history",
  verifyToken,
  requireAuth,
  practiceController.getPracticeHistory
);

module.exports = router;
