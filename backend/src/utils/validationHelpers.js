const { AppError } = require("./appError");

/**
 * Validate tiêu đề bộ từ vựng.
 * @param {string|undefined} title
 * @param {boolean} required - Có bắt buộc không
 */
const validateTitle = (title, required = true) => {
  if (required) {
    if (!title || !title.trim()) {
      throw new AppError("Vui lòng nhập tiêu đề bộ từ vựng", 400);
    }
  }
  if (title !== undefined && title.trim().length > 255) {
    throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
  }
};

/**
 * Validate mô tả.
 * @param {string|undefined} description
 * @param {number} maxLength
 */
const validateDescription = (description, maxLength = 1000) => {
  if (description !== undefined && description?.length > maxLength) {
    throw new AppError(`Mô tả không được dài quá ${maxLength} ký tự`, 400);
  }
};

/**
 * Validate chủ đề từ vựng.
 * @param {string|undefined} topic
 * @param {number} maxLength
 */
const validateTopic = (topic, maxLength = 500) => {
  if (!topic || !topic.trim()) {
    throw new AppError("Vui lòng nhập chủ đề từ vựng", 400);
  }
  if (topic.trim().length > maxLength) {
    throw new AppError(`Chủ đề từ vựng không được dài quá ${maxLength} ký tự`, 400);
  }
};

module.exports = {
  validateTitle,
  validateDescription,
  validateTopic,
};
