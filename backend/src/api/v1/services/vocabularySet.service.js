const vocabularySetModel = require("../repositories/vocabularySet.model");
const vocabularyService = require("./vocabulary.service");
const { generateVocabularyByAI } = require("./ai.service");
const { AppError } = require("../../../utils/appError");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");
const { validateTitle, validateDescription, validateTopic } = require("../../../utils/validationHelpers");

/**
 * Format response vocabulary set.
 * @param {Object} vocabularySet
 * @returns {Object}
 */
const formatVocabularySet = (vocabularySet) => ({
  id: vocabularySet.id,
  title: vocabularySet.title,
  description: vocabularySet.description,
  status: vocabularySet.status,
  createdBy: vocabularySet.created_by,
  createdAt: vocabularySet.created_at,
  updatedAt: vocabularySet.updated_at,
  deleted: vocabularySet.deleted,
});

/**
 * Format response danh sách bộ từ vựng (có số từ).
 * @param {Object} item
 * @param {number} wordCount
 * @returns {Object}
 */
const formatListItem = (item, wordCount) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  wordCount,
});

/**
 * Enrich danh sách items với wordCount.
 * @param {Array} data
 * @param {Function} countFn - Hàm đếm từ (setId) => Promise<number>
 * @returns {Promise<Array>}
 */
const enrichWithWordCount = async (data, countFn) =>
  Promise.all(data.map(async (item) => formatListItem(item, await countFn(item.id))));

/**
 * Tạo vocabulary set mới.
 */
const createVocabularySet = async ({ title, description, createdBy }) => {
  validateTitle(title);
  validateDescription(description);

  const vocabularySet = await vocabularySetModel.create({
    title: title.trim(),
    description: description?.trim() || null,
    status: "private",
    created_by: createdBy,
  });

  return formatVocabularySet(vocabularySet);
};

/**
 * Cập nhật vocabulary set.
 */
const updateVocabularySet = async (id, { title, description }) => {
  if (title !== undefined) validateTitle(title);
  if (description !== undefined) validateDescription(description);

  const vocabularySet = await vocabularySetModel.update(id, {
    title: title?.trim(),
    description: description?.trim() || null,
  });

  return formatVocabularySet(vocabularySet);
};

/**
 * Xóa mềm vocabulary set.
 */
const softDeleteVocabularySet = async (id) => {
  const vocabularySet = await vocabularySetModel.softDelete(id);
  return formatVocabularySet(vocabularySet);
};

/**
 * Lấy danh sách bộ từ vựng của user (có phân trang, tìm kiếm).
 */
const getMySets = async (userId, { keyword, page = 1, limit = 15 }) => {
  const { data, total } = await vocabularySetModel.getMySets(userId, { keyword, page, limit });
  const items = await enrichWithWordCount(data, (setId) => vocabularySetModel.countWordsInSet(setId));
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Lấy danh sách bộ từ vựng public (có phân trang, tìm kiếm).
 */
const getPublicSets = async ({ keyword, page = 1, limit = 15 }) => {
  const { data, total } = await vocabularySetModel.getPublicSets({ keyword, page, limit });
  const items = await enrichWithWordCount(data, (setId) => vocabularySetModel.countWordsInSet(setId));
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Thêm nhiều từ vào một bộ từ vựng.
 */
const addWordsToSet = async (setId, userId, words) => {
  if (!words || words.length === 0) {
    throw new AppError("Vui lòng gửi danh sách từ vựng", 400);
  }

  const uniqueWords = [...new Set(words.map((w) => w.toLowerCase().trim()).filter(Boolean))];

  if (uniqueWords.length === 0) {
    throw new AppError("Danh sách từ vựng không hợp lệ", 400);
  }

  if (uniqueWords.length > 100) {
    throw new AppError("Số từ vựng không được vượt quá 100 từ mỗi lần thêm", 400);
  }

  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.created_by !== userId) {
    throw new AppError("Bạn không có quyền thêm từ vào bộ từ vựng này", 403);
  }

  const wordIds = [];

  for (const wordText of uniqueWords) {
    const existingWord = await vocabularySetModel.findWordByText(wordText);

    if (existingWord) {
      wordIds.push(existingWord.id);
    } else {
      const [dictionaryData, meaning] = await Promise.all([
        vocabularyService.fetchDictionaryData(wordText),
        vocabularyService.fetchMeaning(wordText),
      ]);

      const newWord = await vocabularySetModel.createWord({
        word: wordText,
        phonetic: dictionaryData.phonetic,
        audioUrl: dictionaryData.audioUrl,
        meaning,
      });

      wordIds.push(newWord.id);
    }
  }

  await vocabularySetModel.addWordsToSet(setId, wordIds);
  const totalWords = await vocabularySetModel.countWordsInSet(setId);

  return { setId, addedCount: wordIds.length, totalWords };
};

/**
 * Lấy chi tiết một bộ từ vựng kèm danh sách từ vựng bên trong.
 */
const getDetail = async (setId, userId) => {
  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.status === "private" && vocabularySet.created_by !== userId) {
    throw new AppError("Bạn không có quyền xem bộ từ vựng này", 403);
  }

  const words = await vocabularySetModel.getWordsInSet(setId);

  return {
    id: vocabularySet.id,
    title: vocabularySet.title,
    description: vocabularySet.description,
    status: vocabularySet.status,
    createdBy: vocabularySet.created_by,
    createdAt: vocabularySet.created_at,
    updatedAt: vocabularySet.updated_at,
    wordCount: words.length,
    words,
  };
};

/**
 * Tạo bộ từ vựng mới rồi sinh từ vựng bằng AI.
 */
const generateWordsByTopic = async (userId, title, description, topic, wordCount) => {
  validateTitle(title);
  validateDescription(description);
  validateTopic(topic);

  const vocabularySet = await vocabularySetModel.create({
    title: title.trim(),
    description: description?.trim() || null,
    status: "private",
    created_by: userId,
  });

  const words = await generateVocabularyByAI(topic, wordCount);
  return addWordsToSet(vocabularySet.id, userId, words);
};

/**
 * Xóa một hoặc nhiều từ vựng khỏi bộ từ vựng.
 */
const removeWordsFromSet = async (setId, userId, wordIds) => {
  if (!wordIds || wordIds.length === 0) {
    throw new AppError("Vui lòng gửi danh sách ID từ vựng cần xóa", 400);
  }

  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.created_by !== userId) {
    throw new AppError("Bạn không có quyền xóa từ khỏi bộ từ vựng này", 403);
  }

  await vocabularySetModel.removeWordsFromSet(setId, wordIds);
  const totalWords = await vocabularySetModel.countWordsInSet(setId);

  return { setId, removedCount: wordIds.length, totalWords };
};

/**
 * Yêu cầu public một bộ từ vựng.
 */
const requestPublic = async (setId, userId) => {
  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.created_by !== userId) {
    throw new AppError("Bạn không có quyền yêu cầu public bộ từ vựng này", 403);
  }

  if (vocabularySet.status !== "private") {
    throw new AppError("Chỉ bộ từ vựng ở trạng thái private mới có thể yêu cầu public", 400);
  }

  const updated = await vocabularySetModel.updateStatus(setId, "req_public");
  return formatVocabularySet(updated);
};

/**
 * Lấy danh sách bộ từ vựng đang chờ duyệt public.
 */
const getPendingPublicSets = async ({ keyword, page = 1, limit = 15 }) => {
  const { data, total } = await vocabularySetModel.getPendingPublicSets({ keyword, page, limit });
  const items = await enrichWithWordCount(data, (setId) => vocabularySetModel.countWordsInSet(setId));
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Duyệt public một bộ từ vựng.
 */
const approvePublic = async (setId) => {
  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.status !== "req_public") {
    throw new AppError("Bộ từ vựng không ở trạng thái chờ duyệt", 400);
  }

  const updated = await vocabularySetModel.updateStatus(setId, "public");
  return formatVocabularySet(updated);
};

/**
 * Từ chối duyệt public một bộ từ vựng.
 */
const rejectPublic = async (setId) => {
  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.status !== "req_public") {
    throw new AppError("Bộ từ vựng không ở trạng thái chờ duyệt", 400);
  }

  const updated = await vocabularySetModel.updateStatus(setId, "private");
  return formatVocabularySet(updated);
};

/**
 * Chuyển bộ từ vựng từ public về private.
 */
const makePrivate = async (setId, userId) => {
  const vocabularySet = await vocabularySetModel.findById(setId);

  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (vocabularySet.created_by !== userId) {
    throw new AppError("Bạn không có quyền thay đổi bộ từ vựng này", 403);
  }

  if (vocabularySet.status !== "public") {
    throw new AppError("Chỉ bộ từ vựng ở trạng thái public mới có thể chuyển về private", 400);
  }

  const updated = await vocabularySetModel.updateStatus(setId, "private");
  return formatVocabularySet(updated);
};

module.exports = {
  createVocabularySet,
  updateVocabularySet,
  softDeleteVocabularySet,
  formatVocabularySet,
  formatListItem,
  getMySets,
  getPublicSets,
  addWordsToSet,
  getDetail,
  generateWordsByTopic,
  removeWordsFromSet,
  requestPublic,
  getPendingPublicSets,
  approvePublic,
  rejectPublic,
  makePrivate,
};
