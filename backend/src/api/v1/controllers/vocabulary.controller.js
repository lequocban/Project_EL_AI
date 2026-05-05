const vocabularyService = require("../services/vocabulary.service");
const { success } = require("../../../utils/responseHandler");

/**
 * POST /api/v1/vocabulary/lookup
 * Tra cứu từ vựng: nếu có trong DB thì trả về, chưa có thì gọi API bên ngoài và lưu vào DB.
 */
const lookupWord = async (req, res, next) => {
  try {
    const { word } = req.body;
    const result = await vocabularyService.lookupWord(word);
    return success(res, result, "Tra cứu từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = { lookupWord };
