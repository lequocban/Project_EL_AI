const generateListeningService = require("../../services/generateListening.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * POST /api/v1/listening-lessons/generate-ai
 * Tao bai luyen nghe bang AI (ke ca transcript, audio, va cau hoi).
 */
const generateListeningByAI = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, topic, questionCount } = req.body;

    const result = await generateListeningService.createListeningLessonByAI(userId, {
      title,
      topic,
      questionCount,
    });

    return success(res, result, "Tao bai luyen nghe bang AI thanh cong", 201);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateListeningByAI,
};
