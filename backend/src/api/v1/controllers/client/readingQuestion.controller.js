const readingQuestionService = require("../../services/readingQuestion.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * POST /api/v1/reading-lessons/:lessonId/questions
 * Tạo mới một câu hỏi cho bài luyện đọc.
 */
const createQuestion = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { question, option_a, option_b, option_c, option_d, correct_answer, explain } = req.body;

    const result = await readingQuestionService.createQuestion(userId, {
      lesson_id: lessonId,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explain,
    });

    return success(res, result, "Tạo câu hỏi thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/reading-lessons/:lessonId/questions/bulk
 * Tạo nhiều câu hỏi cùng lúc cho bài luyện đọc.
 */
const createManyQuestions = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { questions } = req.body;

    const result = await readingQuestionService.createManyQuestions(userId, lessonId, questions);

    return success(res, result, "Tạo nhiều câu hỏi thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/reading-lessons/:lessonId/questions
 * Lấy danh sách câu hỏi của một bài luyện đọc.
 */
const getQuestionsByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const result = await readingQuestionService.getQuestionsByLesson(userId, lessonId);

    return success(res, result, "Lấy danh sách câu hỏi thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/reading-questions/:id
 * Cập nhật câu hỏi.
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { question, option_a, option_b, option_c, option_d, correct_answer, explain } = req.body;

    const result = await readingQuestionService.updateQuestion(userId, id, {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explain,
    });

    return success(res, result, "Cập nhật câu hỏi thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/reading-questions/:id
 * Xóa một câu hỏi.
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await readingQuestionService.deleteQuestion(userId, id);

    return success(res, result, "Xóa câu hỏi thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/reading-questions/bulk
 * Xóa nhiều câu hỏi.
 */
const deleteManyQuestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    await readingQuestionService.deleteManyQuestions(userId, ids);

    return success(res, { deletedCount: ids.length }, "Xóa câu hỏi thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createQuestion,
  createManyQuestions,
  getQuestionsByLesson,
  updateQuestion,
  deleteQuestion,
  deleteManyQuestions,
};
