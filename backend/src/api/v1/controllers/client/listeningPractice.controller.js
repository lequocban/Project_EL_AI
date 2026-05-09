const listeningPracticeService = require("../../services/listeningPractice.service");
const { success } = require("../../../../utils/responseHandler");
const { parsePagination } = require("../../../../utils/pagination");

/**
 * POST /api/v1/listening-lessons/:lessonId/practice/submit
 * Nộp bài luyện nghe.
 * Body: { answers: [{ questionId, answer }] }
 * Trả về điểm số, kết quả chi tiết từng câu.
 */
const submitListeningPractice = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const result = await listeningPracticeService.submitListeningPractice(
      userId,
      lessonId,
      answers
    );

    return success(res, result, "Nộp bài luyện nghe thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/listening-lessons/practice/history
 * Lấy lịch sử luyện nghe của user (có phân trang).
 */
const getPracticeHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = parsePagination(req.query, {
      defaultLimit: 10,
      maxLimit: 20,
    });

    const result = await listeningPracticeService.getPracticeHistory(userId, { page, limit });

    return success(res, result, "Lấy lịch sử luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/listening-lessons/practice/:practiceId
 * Lấy chi tiết một bài luyện nghe đã làm.
 */
const getPracticeDetail = async (req, res, next) => {
  try {
    const { practiceId } = req.params;
    const userId = req.user.id;

    const result = await listeningPracticeService.getPracticeDetail(practiceId, userId);

    return success(res, result, "Lấy chi tiết bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitListeningPractice,
  getPracticeHistory,
  getPracticeDetail,
};
