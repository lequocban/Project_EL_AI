const vocabularySetService = require("../../services/vocabularySet.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * Parse pagination query params.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(15, Math.max(1, parseInt(query.limit, 10) || 15));
  return { page, limit };
};

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

/**
 * POST /api/v1/vocabulary-sets/:id/words
 * Thêm nhiều từ vào bộ từ vựng.
 */
const addWords = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { words } = req.body;
    const userId = req.user.id;

    const result = await vocabularySetService.addWordsToSet(id, userId, words);

    return success(res, result, "Thêm từ vào bộ từ vựng thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/vocabulary-sets/my
 * Lấy danh sách bộ từ vựng do user tạo ra (có phân trang, tìm kiếm).
 */
const getMyVocabularySets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await vocabularySetService.getMySets(userId, { keyword, page, limit });

    return success(res, result, "Lấy danh sách bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/vocabulary-sets/public
 * Lấy danh sách bộ từ vựng public (có phân trang, tìm kiếm).
 */
const getPublicVocabularySets = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await vocabularySetService.getPublicSets({ keyword, page, limit });

    return success(res, result, "Lấy danh sách bộ từ vựng public thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/vocabulary-sets/:id
 * Lấy chi tiết bộ từ vựng kèm danh sách từ vựng.
 */
const getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await vocabularySetService.getDetail(id, userId);

    return success(res, result, "Lấy chi tiết bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createVocabularySet,
  updateVocabularySet,
  deleteVocabularySet,
  addWords,
  getMyVocabularySets,
  getPublicVocabularySets,
  getDetail,
};
