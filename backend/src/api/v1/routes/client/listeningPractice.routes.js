const router = require("express").Router();
const listeningPracticeController = require("../../controllers/client/listeningPractice.controller");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");
const { validateBody } = require("../../validations/validate");
const { submitListeningPracticeSchema } = require("../../validations/listeningPractice.validation");

/**
 * POST /api/v1/listening-lessons/:lessonId/practice/submit
 * Nộp bài luyện nghe.
 */
router.post(
  "/:lessonId/practice/submit",
  verifyToken,
  requireAuth,
  validateBody(submitListeningPracticeSchema),
  listeningPracticeController.submitListeningPractice
);

/**
 * GET /api/v1/listening-lessons/practice/history
 * Lấy lịch sử luyện nghe của user (có phân trang).
 */
router.get(
  "/practice/history",
  verifyToken,
  requireAuth,
  listeningPracticeController.getPracticeHistory
);

/**
 * GET /api/v1/listening-lessons/practice/:practiceId
 * Lấy chi tiết một bài luyện nghe đã làm.
 */
router.get(
  "/practice/:practiceId",
  verifyToken,
  requireAuth,
  listeningPracticeController.getPracticeDetail
);

module.exports = router;
