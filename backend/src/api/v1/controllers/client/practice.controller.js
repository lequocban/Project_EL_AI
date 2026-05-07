const practiceService = require("../../services/practice.service");
const { success } = require("../../../../utils/responseHandler");
const { AppError } = require("../../../../utils/appError");
const { z } = require("zod");

// Schema cho quiz/listening_quiz - answer là string (nghĩa tiếng Việt)
const choiceAnswerSchema = z.object({
  wordId: z.string().uuid("wordId phải là UUID hợp lệ"),
  answer: z.string().min(1, "Đáp án không được rỗng"),
});

// Schema cho translate_write/listen_write - answer là string (từ tiếng Anh)
const writeAnswerSchema = z.object({
  wordId: z.string().uuid("wordId phải là UUID hợp lệ"),
  answer: z.string().min(1, "Đáp án không được rỗng"),
});

/**
 * Validate đáp án theo từng loại bài tập.
 * @param {string} type - Loại bài tập
 * @param {Array} answers - Danh sách đáp án
 * @returns {Array} - Danh sách đáp án đã validate
 */
const validateAnswers = (type, answers) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new AppError("Danh sách đáp án không được rỗng", 400);
  }

  // quiz/listening_quiz: trả lời bằng nghĩa tiếng Việt
  // translate_write/listen_write: nhập từ tiếng Anh
  const schema = (type === "quiz" || type === "listening_quiz")
    ? choiceAnswerSchema
    : writeAnswerSchema;

  const errors = [];
  const validatedAnswers = [];

  for (let i = 0; i < answers.length; i++) {
    const result = schema.safeParse(answers[i]);
    if (!result.success) {
      errors.push({
        index: i,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    } else {
      validatedAnswers.push(result.data);
    }
  }

  if (errors.length > 0) {
    const err = new AppError("Dữ liệu đáp án không hợp lệ", 400);
    err.errors = errors;
    throw err;
  }

  return validatedAnswers;
};

/**
 * Parse pagination query params.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(query.limit, 10) || 10));
  return { page, limit };
};

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

    // Validate đáp án theo từng loại bài tập
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
    const { page, limit } = parsePagination(req.query);

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
