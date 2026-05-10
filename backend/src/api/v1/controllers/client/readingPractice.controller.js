const readingPracticeService = require("../../services/readingPractice.service");
const { success } = require("../../../../utils/responseHandler");
const { parsePagination } = require("../../../../utils/pagination");

/**
 * POST /api/v1/reading-lessons/:lessonId/practice/submit
 * Nộp bài luyện đọc.
 * Body: { answers: [{ questionId, answer }] }
 * Trả về điểm số, kết quả chi tiết từng câu.
 */
const submitReadingPractice = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const result = await readingPracticeService.submitReadingPractice(
      userId,
      lessonId,
      answers
    );

    return success(res, result, "Nộp bài luyện đọc thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/reading-lessons/practice/history
 * Lấy lịch sử luyện đọc của user (có phân trang, sắp xếp).
 */
const getPracticeHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = parsePagination(req.query, {
      defaultLimit: 10,
      maxLimit: 20,
    });
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "";

    const result = await readingPracticeService.getPracticeHistory(userId, { page, limit, sortField, sortOrder });

    return success(res, result, "Lấy lịch sử luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/reading-lessons/practice/:practiceId
 * Lấy chi tiết một bài luyện đọc đã làm.
 */
const getPracticeDetail = async (req, res, next) => {
  try {
    const { practiceId } = req.params;
    const userId = req.user.id;

    const result = await readingPracticeService.getPracticeDetail(practiceId, userId);

    return success(res, result, "Lấy chi tiết bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitReadingPractice,
  getPracticeHistory,
  getPracticeDetail,
};
