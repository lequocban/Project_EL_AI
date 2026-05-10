const moderationAdminService = require("../../services/moderationAdmin.service");
const { success } = require("../../../../utils/responseHandler");
const { AppError } = require("../../../../utils/appError");

// ============================================================
// LẤY DANH SÁCH YÊU CẦU KIỂM DUYỆT
// ============================================================

/**
 * GET /api/v1/admin/moderation/vocabulary-sets
 * Lấy danh sách yêu cầu kiểm duyệt bộ từ vựng.
 */
const getVocabularySetRequests = async (req, res, next) => {
  try {
    const result = await moderationAdminService.getModerationRequestsByContentType(
      req.accessToken,
      "vocabulary_set",
      req.query
    );

    return success(res, result, "Lấy danh sách yêu cầu kiểm duyệt bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/admin/moderation/reading-lessons
 * Lấy danh sách yêu cầu kiểm duyệt bài luyện đọc.
 */
const getReadingLessonRequests = async (req, res, next) => {
  try {
    const result = await moderationAdminService.getModerationRequestsByContentType(
      req.accessToken,
      "reading_lesson",
      req.query
    );

    return success(res, result, "Lấy danh sách yêu cầu kiểm duyệt bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/admin/moderation/listening-lessons
 * Lấy danh sách yêu cầu kiểm duyệt bài luyện nghe.
 */
const getListeningLessonRequests = async (req, res, next) => {
  try {
    const result = await moderationAdminService.getModerationRequestsByContentType(
      req.accessToken,
      "listening_lesson",
      req.query
    );

    return success(res, result, "Lấy danh sách yêu cầu kiểm duyệt bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// CHỈNH SỬA NỘI DUNG
// ============================================================

/**
 * PUT /api/v1/admin/moderation/vocabulary-sets/:id
 * Chỉnh sửa bộ từ vựng (khi đang pending kiểm duyệt).
 */
const updateVocabularySet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await moderationAdminService.updateVocabularySet(
      req.accessToken,
      id,
      req.body
    );

    return success(res, result, "Chỉnh sửa bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/v1/admin/moderation/reading-lessons/:id
 * Chỉnh sửa bài luyện đọc (khi đang pending kiểm duyệt).
 */
const updateReadingLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await moderationAdminService.updateReadingLesson(
      req.accessToken,
      id,
      req.body
    );

    return success(res, result, "Chỉnh sửa bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/v1/admin/moderation/reading-questions/:questionId
 * Chỉnh sửa câu hỏi đọc hiểu (khi bài luyện đọc đang pending kiểm duyệt).
 * Body: { lessonId, question, optionA, optionB, optionC, optionD, correctAnswer, explain }
 */
const updateReadingQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { lessonId, question, option_a, option_b, option_c, option_d, correct_answer, explain } = req.body;

    if (!lessonId) {
      return next(new AppError("Vui lòng cung cấp lessonId", 400));
    }

    const result = await moderationAdminService.updateReadingQuestion(
      req.accessToken,
      questionId,
      lessonId,
      { question, option_a, option_b, option_c, option_d, correct_answer, explain }
    );

    return success(res, result, "Chỉnh sửa câu hỏi đọc hiểu thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/v1/admin/moderation/listening-lessons/:id
 * Chỉnh sửa bài luyện nghe (khi đang pending kiểm duyệt).
 */
const updateListeningLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await moderationAdminService.updateListeningLesson(
      req.accessToken,
      id,
      req.body
    );

    return success(res, result, "Chỉnh sửa bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/v1/admin/moderation/listening-questions/:questionId
 * Chỉnh sửa câu hỏi nghe hiểu (khi bài luyện nghe đang pending kiểm duyệt).
 * Body: { lessonId, question, optionA, optionB, optionC, optionD, correctAnswer, explain }
 */
const updateListeningQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { lessonId, question, option_a, option_b, option_c, option_d, correct_answer, explain } = req.body;

    if (!lessonId) {
      return next(new AppError("Vui lòng cung cấp lessonId", 400));
    }

    const result = await moderationAdminService.updateListeningQuestion(
      req.accessToken,
      questionId,
      lessonId,
      { question, option_a, option_b, option_c, option_d, correct_answer, explain }
    );

    return success(res, result, "Chỉnh sửa câu hỏi nghe hiểu thành công");
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// QUẢN LÝ TỪ VỰNG TRONG BỘ TỪ VỰNG
// ============================================================

/**
 * POST /api/v1/admin/moderation/vocabulary-sets/:id/words
 * Thêm từ vựng vào bộ từ vựng (khi đang pending kiểm duyệt).
 * Body: { words: ["word1", "word2"] }
 * Tự động gọi Dictionary API + Translate API để lấy phonetic, audioUrl, meaning.
 */
const addWordsToVocabularySet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { words } = req.body;

    if (!words) {
      return next(new AppError("Vui lòng cung cấp danh sách từ vựng", 400));
    }

    const result = await moderationAdminService.addWordsToVocabularySet(
      req.accessToken,
      id,
      words
    );

    return success(res, result, "Thêm từ vựng vào bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/admin/moderation/vocabulary-sets/:id/words
 * Xóa từ vựng khỏi bộ từ vựng (khi đang pending kiểm duyệt).
 * Body: { wordIds: ["uuid1", "uuid2", ...] }
 */
const removeWordsFromVocabularySet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { wordIds } = req.body;

    if (!wordIds) {
      return next(new AppError("Vui lòng cung cấp danh sách wordIds cần xóa", 400));
    }

    const result = await moderationAdminService.removeWordsFromVocabularySet(
      req.accessToken,
      id,
      wordIds
    );

    return success(res, result, "Xóa từ vựng khỏi bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// LẤY CHI TIẾT YÊU CẦU KIỂM DUYỆT
// ============================================================

/**
 * GET /api/v1/admin/moderation/requests/:requestId
 * Lấy chi tiết một yêu cầu kiểm duyệt (kèm nội dung đầy đủ).
 * - vocabulary_set: trả về thông tin bộ từ vựng + danh sách từ vựng
 * - reading_lesson: trả về thông tin bài luyện đọc + danh sách câu hỏi
 * - listening_lesson: trả về thông tin bài luyện nghe + danh sách câu hỏi
 */
const getModerationRequestDetail = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const result = await moderationAdminService.getModerationRequestDetail(requestId);

    return success(res, result, "Lấy chi tiết yêu cầu kiểm duyệt thành công");
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// PHÊ DUYỆT / TỪ CHỐI YÊU CẦU KIỂM DUYỆT
// ============================================================

/**
 * POST /api/v1/admin/moderation/requests/:requestId/review
 * Xác nhận (approve) hoặc từ chối (reject) yêu cầu kiểm duyệt.
 * Chỉ cập nhật bảng moderation_requests: status, reviewed_by, reviewed_at, reason, notes.
 * Body: { action: "approve" | "reject", reason?: string, notes?: string }
 */
const reviewModerationRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { action, reason, notes } = req.body;

    if (!action) {
      return next(new AppError("Vui lòng cung cấp action ('approve' hoặc 'reject')", 400));
    }

    const result = await moderationAdminService.reviewModerationRequest(
      req.user.id,
      requestId,
      { action, reason, notes }
    );

    return success(res, result, `Yêu cầu kiểm duyệt đã được ${action === "approve" ? "duyệt" : "từ chối"} thành công`);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getVocabularySetRequests,
  getReadingLessonRequests,
  getListeningLessonRequests,
  updateVocabularySet,
  updateReadingLesson,
  updateReadingQuestion,
  updateListeningLesson,
  updateListeningQuestion,
  addWordsToVocabularySet,
  removeWordsFromVocabularySet,
  getModerationRequestDetail,
  reviewModerationRequest,
};
