const practiceService = require("../../services/practice.service");
const { success } = require("../../../../utils/responseHandler");
const { parsePagination } = require("../../../../utils/pagination");
const { validateAnswers } = require("../../validations/practice.validation");

/**
 * POST /api/v1/vocabulary-sets/practice/submit
 * Nộp bài luyện tập từ vựng.
 * Body: { setId, type, timeSpent, answers }
 * Trả về điểm số, tổng câu, số câu đúng, danh sách từ sai.
 */
const submitPractice = async (req, res, next) => {
  try {
    const { setId, type, timeSpent, answers } = req.body;
    const userId = req.user.id;

    const validatedAnswers = validateAnswers(type, answers);

    const result = await practiceService.submitPractice(
      userId,
      setId,
      type,
      timeSpent,
      validatedAnswers
    );

    return success(res, result, "Nộp bài luyện tập thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/vocabulary-sets/practice/history
 * Lấy lịch sử luyện tập của user (có phân trang).
 */
const getPracticeHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = parsePagination(req.query, {
      defaultLimit: 10,
      maxLimit: 20,
    });

    const result = await practiceService.getPracticeHistory(userId, { page, limit });

    return success(res, result, "Lấy lịch sử luyện tập thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitPractice,
  getPracticeHistory,
};
