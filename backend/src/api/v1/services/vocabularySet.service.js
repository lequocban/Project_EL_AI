const vocabularySetModel = require("../repositories/vocabularySet.model");
const vocabularyService = require("./vocabulary.service");
const { generateVocabularyByAI } = require("./ai.service");
const { AppError } = require("../../../utils/appError");

/**
 * Format response vocabulary set.
 * @param {Object} vocabularySet
 * @returns {Object}
 */
const formatVocabularySet = (vocabularySet) => {
  return {
    id: vocabularySet.id,
    title: vocabularySet.title,
    description: vocabularySet.description,
    status: vocabularySet.status,
    createdBy: vocabularySet.created_by,
    createdAt: vocabularySet.created_at,
    updatedAt: vocabularySet.updated_at,
    deleted: vocabularySet.deleted,
  };
};

/**
 * Format response danh sách bộ từ vựng (có số từ).
 * @param {Object} item
 * @param {number} wordCount
 * @returns {Object}
 */
const formatListItem = (item, wordCount) => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    wordCount,
  };
};

/**
 * Tạo vocabulary set mới.
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} params.createdBy
 * @returns {Promise<Object>}
 */
const createVocabularySet = async ({ title, description, createdBy }) => {
  if (!title || !title.trim()) {
    throw new AppError("Vui lòng nhập tiêu đề bộ từ vựng", 400);
  }

  if (title.trim().length > 255) {
    throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
  }

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
 * @param {string} id
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} params.status
 * @param {string} params.userId
 * @returns {Promise<Object>}
 */
const updateVocabularySet = async (id, { title, description, status, userId }) => {
  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new AppError("Vui lòng nhập tiêu đề bộ từ vựng", 400);
    }
    if (title.trim().length > 255) {
      throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
    }
  }

  if (description !== undefined && description?.length > 1000) {
    throw new AppError("Mô tả không được dài quá 1000 ký tự", 400);
  }

  const validStatuses = ["private", "public"];
  if (status !== undefined && !validStatuses.includes(status)) {
    throw new AppError("Trạng thái không hợp lệ. Chỉ chấp nhận 'private' hoặc 'public'", 400);
  }

  const vocabularySet = await vocabularySetModel.update(id, {
    title: title?.trim(),
    description: description?.trim() || null,
    status,
  });

  return formatVocabularySet(vocabularySet);
};

/**
 * Xóa mềm vocabulary set.
 * @param {string} id
 * @returns {Promise<Object>}
 */
const softDeleteVocabularySet = async (id) => {
  const vocabularySet = await vocabularySetModel.softDelete(id);
  return formatVocabularySet(vocabularySet);
};

/**
 * Lấy danh sách bộ từ vựng của user (có phân trang, tìm kiếm, số từ trong bộ).
 * @param {string} userId
 * @param {Object} options
 * @param {string} options.keyword
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<Object>}
 */
const getMySets = async (userId, { keyword, page = 1, limit = 15 }) => {
  const { data, total } = await vocabularySetModel.getMySets(userId, { keyword, page, limit });

  const items = await Promise.all(
    data.map(async (item) => {
      const wordCount = await vocabularySetModel.countWordsInSet(item.id);
      return formatListItem(item, wordCount);
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

/**
 * Lấy danh sách bộ từ vựng public (có phân trang, tìm kiếm, số từ trong bộ).
 * @param {Object} options
 * @param {string} options.keyword
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<Object>}
 */
const getPublicSets = async ({ keyword, page = 1, limit = 15 }) => {
  const { data, total } = await vocabularySetModel.getPublicSets({ keyword, page, limit });

  const items = await Promise.all(
    data.map(async (item) => {
      const wordCount = await vocabularySetModel.countWordsInSet(item.id);
      return formatListItem(item, wordCount);
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

/**
 * Thêm nhiều từ vào một bộ từ vựng.
 * - Kiểm tra bộ từ vựng có tồn tại và thuộc về user không
 * - Với mỗi từ: nếu chưa có trong DB → gọi API lookup → lưu vào DB
 * - Sau đó lưu các word_id vào bảng vocabulary_set_words
 *
 * @param {string} setId - ID của bộ từ vựng
 * @param {string} userId - ID của user (để kiểm tra quyền sở hữu)
 * @param {Array<string>} words - Mảng từ tiếng Anh cần thêm
 * @returns {Promise<Object>}
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

  return {
    setId,
    addedCount: wordIds.length,
    totalWords,
  };
};

/**
 * Lấy chi tiết một bộ từ vựng kèm danh sách từ vựng bên trong.
 * @param {string} setId
 * @param {string} userId - để kiểm tra bộ private có thuộc về user không
 * @returns {Promise<Object>}
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
 * Tạo bộ từ vựng mới rồi sinh từ vựng bằng AI và thêm vào bộ vừa tạo.
 * - Tạo bộ từ vựng mới với title, description
 * - Gọi AI (OpenRouter) để sinh danh sách từ theo chủ đề
 * - Với mỗi từ: nếu chưa có trong DB → gọi API lookup → lưu vào DB
 * - Sau đó lưu các word_id vào bảng vocabulary_set_words
 *
 * @param {string} userId - ID của user (để kiểm tra quyền sở hữu)
 * @param {string} title - Tiêu đề bộ từ vựng
 * @param {string|null} description - Mô tả bộ từ vựng
 * @param {string} topic - Chủ đề từ vựng người dùng mô tả
 * @param {number} [wordCount] - Số từ muốn sinh (mặc định: 10)
 * @returns {Promise<Object>}
 */
const generateWordsByTopic = async (userId, title, description, topic, wordCount) => {
  if (!title || !title.trim()) {
    throw new AppError("Vui lòng nhập tiêu đề bộ từ vựng", 400);
  }

  if (title.trim().length > 255) {
    throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
  }

  if (description && description.length > 1000) {
    throw new AppError("Mô tả không được dài quá 1000 ký tự", 400);
  }

  if (!topic || !topic.trim()) {
    throw new AppError("Vui lòng nhập chủ đề từ vựng", 400);
  }

  if (topic.trim().length > 500) {
    throw new AppError("Chủ đề từ vựng không được dài quá 500 ký tự", 400);
  }

  // Tạo bộ từ vựng mới
  const vocabularySet = await vocabularySetModel.create({
    title: title.trim(),
    description: description?.trim() || null,
    status: "private",
    created_by: userId,
  });

  const setId = vocabularySet.id;

  // Gọi AI sinh từ vựng theo chủ đề
  const words = await generateVocabularyByAI(topic, wordCount);

  // Thêm từ vựng vào bộ vừa tạo
  return await addWordsToSet(setId, userId, words);
};

/**
 * Xóa một hoặc nhiều từ vựng khỏi bộ từ vựng.
 * - Kiểm tra bộ từ vựng có tồn tại và thuộc về user không
 * - Xóa các word_id khỏi bảng vocabulary_set_words
 *
 * @param {string} setId - ID của bộ từ vựng
 * @param {string} userId - ID của user (để kiểm tra quyền sở hữu)
 * @param {Array<string>} wordIds - Mảng ID từ vựng cần xóa
 * @returns {Promise<Object>}
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

  return {
    setId,
    removedCount: wordIds.length,
    totalWords,
  };
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
};
