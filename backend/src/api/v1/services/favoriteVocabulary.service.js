const favoriteVocabularyModel = require("../repositories/favoriteVocabulary.model");
const vocabularySetModel = require("../repositories/vocabularySet.model");
const { AppError } = require("../../../utils/appError");

/**
 * Thêm bộ từ vựng vào yêu thích.
 * @param {string} accessToken
 * @param {string} userId
 * @param {string} setId
 * @returns {Promise<Object>}
 */
const addFavorite = async (accessToken, userId, setId) => {
  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.status === "private" && vocabularySet.created_by !== userId) {
    throw new AppError("Không thể thêm bộ từ vựng private vào yêu thích", 403);
  }

  await favoriteVocabularyModel.addFavorite(accessToken, userId, setId);

  return { vocabularyId: setId };
};

/**
 * Xóa bộ từ vựng khỏi yêu thích.
 * @param {string} accessToken
 * @param {string} userId
 * @param {string} setId
 * @returns {Promise<void>}
 */
const removeFavorite = async (accessToken, userId, setId) => {
  await favoriteVocabularyModel.removeFavorite(accessToken, userId, setId);
};

/**
 * Lấy danh sách bộ từ vựng yêu thích (có phân trang, tìm kiếm, số từ trong bộ).
 * @param {string} accessToken
 * @param {string} userId
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const getFavorites = async (accessToken, userId, { keyword, page = 1, limit = 15 }) => {
  const { data, total } = await favoriteVocabularyModel.getFavorites(accessToken, userId, {
    keyword,
    page,
    limit,
  });

  const items = await Promise.all(
    data.map(async (item) => {
      const wordCount = await vocabularySetModel.countWordsInSet(item.id);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        wordCount,
      };
    })
  );

  const safeLimit = Math.min(Math.max(1, limit), 15);
  const totalPages = Math.ceil(total / safeLimit);

  return {
    items,
    pagination: {
      page,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
};

module.exports = { addFavorite, removeFavorite, getFavorites };
