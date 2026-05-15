const explainByAIService = require("../../services/explainByAI.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * POST /api/v1/explain-by-ai
 * Giải thích chi tiết đáp án bài luyện đọc/nghe bằng AI.
 * Body: { lessonType, content, viTranslation, question, allAnswers, userAnswer, correctAnswer }
 */
const explainAnswer = async (req, res, next) => {
  try {
    const { lessonType, content, viTranslation, question, allAnswers, userAnswer, correctAnswer } = req.body;

    const explanation = await explainByAIService.explainAnswerByAI({
      lessonType,
      content,
      viTranslation,
      question,
      allAnswers,
      userAnswer,
      correctAnswer,
    });

    return success(res, { explanation }, "Giải thích chi tiết đáp án thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  explainAnswer,
};
