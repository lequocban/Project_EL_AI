const router = require("express").Router();
const moderationAdminController = require("../../controllers/admin/moderation.controller");
const { verifyToken, requireAuth, requireManagerOrAdmin } = require("../../middlewares/auth.middleware");

// ============================================================
// LẤY DANH SÁCH YÊU CẦU KIỂM DUYỆT
// ============================================================

// GET /api/v1/admin/moderation/vocabulary-sets — Danh sách yêu cầu kiểm duyệt bộ từ vựng
router.get(
  "/vocabulary-sets",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.getVocabularySetRequests
);

// GET /api/v1/admin/moderation/reading-lessons — Danh sách yêu cầu kiểm duyệt bài luyện đọc
router.get(
  "/reading-lessons",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.getReadingLessonRequests
);

// GET /api/v1/admin/moderation/listening-lessons — Danh sách yêu cầu kiểm duyệt bài luyện nghe
router.get(
  "/listening-lessons",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.getListeningLessonRequests
);

// ============================================================
// LẤY CHI TIẾT YÊU CẦU KIỂM DUYỆT
// ============================================================

// GET /api/v1/admin/moderation/requests/:requestId
// Lấy chi tiết một yêu cầu kiểm duyệt (kèm nội dung đầy đủ)
router.get(
  "/requests/:requestId",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.getModerationRequestDetail
);

// ============================================================
// PHÊ DUYỆT / TỪ CHỐI YÊU CẦU KIỂM DUYỆT
// ============================================================

// POST /api/v1/admin/moderation/requests/:requestId/review
// Xác nhận (approve) hoặc từ chối (reject) yêu cầu kiểm duyệt
// Body: { action: "approve" | "reject", reason?: string, notes?: string }
router.post(
  "/requests/:requestId/review",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.reviewModerationRequest
);

// ============================================================
// CHỈNH SỬA NỘI DUNG (YÊU CẦU CONTENT ĐANG PENDING)
// ============================================================

// PATCH /api/v1/admin/moderation/vocabulary-sets/:id
// Chỉnh sửa bộ từ vựng (khi đang pending kiểm duyệt)
router.patch(
  "/vocabulary-sets/:id",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.updateVocabularySet
);

// PATCH /api/v1/admin/moderation/reading-lessons/:id
// Chỉnh sửa bài luyện đọc (khi đang pending kiểm duyệt)
router.patch(
  "/reading-lessons/:id",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.updateReadingLesson
);

// PATCH /api/v1/admin/moderation/reading-questions/:questionId
// Chỉnh sửa câu hỏi đọc hiểu (khi bài luyện đọc đang pending)
// Body: { lessonId, question?, optionA?, optionB?, optionC?, optionD?, correctAnswer?, explain? }
router.patch(
  "/reading-questions/:questionId",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.updateReadingQuestion
);

// PATCH /api/v1/admin/moderation/listening-lessons/:id
// Chỉnh sửa bài luyện nghe (khi đang pending kiểm duyệt)
router.patch(
  "/listening-lessons/:id",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.updateListeningLesson
);

// PATCH /api/v1/admin/moderation/listening-questions/:questionId
// Chỉnh sửa câu hỏi nghe hiểu (khi bài luyện nghe đang pending)
// Body: { lessonId, question?, optionA?, optionB?, optionC?, optionD?, correctAnswer?, explain? }
router.patch(
  "/listening-questions/:questionId",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.updateListeningQuestion
);

// ============================================================
// QUẢN LÝ TỪ VỰNG TRONG BỘ TỪ VỰNG
// ============================================================

// POST /api/v1/admin/moderation/vocabulary-sets/:id/words
// Thêm từ vựng vào bộ từ vựng (khi đang pending kiểm duyệt)
// Body: { words: ["word1", "word2"] }
router.post(
  "/vocabulary-sets/:id/words",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.addWordsToVocabularySet
);

// DELETE /api/v1/admin/moderation/vocabulary-sets/:id/words
// Xóa từ vựng khỏi bộ từ vựng (khi đang pending kiểm duyệt)
// Body: { wordIds: ["uuid1", "uuid2", ...] }
router.delete(
  "/vocabulary-sets/:id/words",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  moderationAdminController.removeWordsFromVocabularySet
);

module.exports = router;
