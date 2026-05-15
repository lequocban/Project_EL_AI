const favoriteVocabularyRepository = require("../repositories/favoriteVocabulary.repository");
const vocabularySetRepository = require("../repositories/vocabularySet.repository");
const { AppError } = require("../../../utils/appError");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");

/**
 * Thêm bộ từ vựng vào yêu thích.
 */
const addFavorite = async (accessToken, userId, setId) => {
  const vocabularySet = await vocabularySetRepository.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.status === "private" && vocabularySet.created_by !== userId) {
    throw new AppError("Không thể thêm bộ từ vựng private vào yêu thích", 403);
  }

  await favoriteVocabularyRepository.addFavorite(accessToken, userId, setId);
  return { vocabularyId: setId };
};

/**
 * Xóa bộ từ vựng khỏi yêu thích.
 */
const removeFavorite = async (accessToken, userId, setId) => {
  await favoriteVocabularyRepository.removeFavorite(accessToken, userId, setId);
};

/**
 * Lấy danh sách bộ từ vựng yêu thích (có phân trang, tìm kiếm, sắp xếp, số từ trong bộ).
 */
const getFavorites = async (accessToken, userId, { keyword, page = 1, limit = 15, sortField, sortOrder }) => {
  const { data, total } = await favoriteVocabularyRepository.getFavorites(accessToken, userId, {
    keyword,
    page,
    limit,
    sortField,
    sortOrder,
  });

  const items = await Promise.all(
    data.map(async (item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      wordCount: await vocabularySetRepository.countWordsInSet(item.id),
    }))
  );

  return buildPaginationResponse(items, { page, limit, total });
};

module.exports = { addFavorite, removeFavorite, getFavorites };
