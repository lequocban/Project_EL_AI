const vocabularySetModel = require("../repositories/vocabularySet.model");
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

module.exports = {
  createVocabularySet,
  updateVocabularySet,
  softDeleteVocabularySet,
  formatVocabularySet,
};
