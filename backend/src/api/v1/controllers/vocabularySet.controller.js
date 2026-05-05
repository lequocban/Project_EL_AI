const vocabularySetService = require("../services/vocabularySet.service");
const { success } = require("../../../utils/responseHandler");

/**
 * POST /api/v1/vocabulary-sets
 * Tạo mới một bộ từ vựng.
 */
const createVocabularySet = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const createdBy = req.user.id;

    const result = await vocabularySetService.createVocabularySet({
      title,
      description,
      createdBy,
    });

    return success(res, result, "Tạo bộ từ vựng thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/vocabulary-sets/:id
 * Cập nhật bộ từ vựng.
 */
const updateVocabularySet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const result = await vocabularySetService.updateVocabularySet(id, {
      title,
      description,
      status,
    });

    return success(res, result, "Cập nhật bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/vocabulary-sets/:id
 * Xóa mềm bộ từ vựng (cập nhật trường deleted = true).
 */
const deleteVocabularySet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await vocabularySetService.softDeleteVocabularySet(id);

    return success(res, result, "Xóa bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createVocabularySet,
  updateVocabularySet,
  deleteVocabularySet,
};
