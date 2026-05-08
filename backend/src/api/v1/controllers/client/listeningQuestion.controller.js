const listeningQuestionService = require("../../services/listeningQuestion.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * POST /api/v1/listening-lessons/:lessonId/questions
 * Tạo mới một câu hỏi cho bài luyện nghe.
 */
const createQuestion = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { question, option_a, option_b, option_c, option_d, correct_answer, explain } = req.body;

    const result = await listeningQuestionService.createQuestion(userId, {
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
 * POST /api/v1/listening-lessons/:lessonId/questions/bulk
 * Tạo nhiều câu hỏi cùng lúc cho bài luyện nghe.
 */
const createManyQuestions = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { questions } = req.body;

    const result = await listeningQuestionService.createManyQuestions(userId, lessonId, questions);

    return success(res, result, "Tạo nhiều câu hỏi thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/listening-lessons/:lessonId/questions
 * Lấy danh sách câu hỏi của một bài luyện nghe.
 */
const getQuestionsByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const result = await listeningQuestionService.getQuestionsByLesson(userId, lessonId);

    return success(res, result, "Lấy danh sách câu hỏi thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/listening-questions/:id
 * Cập nhật câu hỏi.
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { question, option_a, option_b, option_c, option_d, correct_answer, explain } = req.body;

    const result = await listeningQuestionService.updateQuestion(userId, id, {
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
 * DELETE /api/v1/listening-questions/:id
 * Xóa một câu hỏi.
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await listeningQuestionService.deleteQuestion(userId, id);

    return success(res, result, "Xóa câu hỏi thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/listening-questions/bulk
 * Xóa nhiều câu hỏi.
 */
const deleteManyQuestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    await listeningQuestionService.deleteManyQuestions(userId, ids);

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
