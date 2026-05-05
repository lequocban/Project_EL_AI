const favoriteVocabularyService = require("../../services/favoriteVocabulary.service");
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
 * POST /api/v1/favorites/vocabulary-sets/:id
 * Thêm bộ từ vựng vào yêu thích.
 */
const addFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const accessToken = req.accessToken;

    const result = await favoriteVocabularyService.addFavorite(accessToken, userId, id);

    return success(res, result, "Thêm vào yêu thích thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/favorites/vocabulary-sets/:id
 * Xóa bộ từ vựng khỏi yêu thích.
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const accessToken = req.accessToken;

    await favoriteVocabularyService.removeFavorite(accessToken, userId, id);

    return success(res, null, "Xóa khỏi yêu thích thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/favorites/vocabulary-sets
 * Lấy danh sách bộ từ vựng yêu thích (có phân trang, tìm kiếm).
 */
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accessToken = req.accessToken;
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await favoriteVocabularyService.getFavorites(accessToken, userId, {
      keyword,
      page,
      limit,
    });

    return success(res, result, "Lấy danh sách yêu thích thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites };
