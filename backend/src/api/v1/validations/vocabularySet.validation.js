const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/vocabulary-sets
 */
const createVocabularySetSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bộ từ vựng")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim(),
  description: z
    .string()
    .max(1000, "Mô tả không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
});

/**
 * Schema validate body cho PATCH /api/v1/vocabulary-sets/:id
 */
const updateVocabularySetSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bộ từ vựng")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Mô tả không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  status: z.enum(["private", "public"]).optional(),
});

/**
 * Schema validate body cho POST /api/v1/vocabulary-sets/:id/words
 */
const addWordsSchema = z.object({
  words: z
    .array(z.string().min(1, "Từ không được rỗng").trim())
    .min(1, "Vui lòng gửi danh sách từ vựng")
    .max(100, "Số từ vựng không được vượt quá 100 từ mỗi lần thêm"),
});

/**
 * Schema validate body cho POST /api/v1/vocabulary-sets/generate-words
 * Tạo bộ từ vựng mới rồi sinh từ vựng bằng AI.
 */
const generateWordsSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bộ từ vựng")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim(),
  description: z
    .string()
    .max(1000, "Mô tả không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  topic: z
    .string()
    .min(1, "Vui lòng nhập chủ đề từ vựng")
    .max(500, "Chủ đề từ vựng không được dài quá 500 ký tự")
    .trim(),
  wordCount: z
    .number()
    .int("Số từ phải là số nguyên")
    .min(1, "Số từ tối thiểu là 1")
    .max(30, "Số từ tối đa là 30")
    .optional()
    .default(10),
});

/**
 * Schema validate body cho DELETE /api/v1/vocabulary-sets/:id/words/remove
 * Xóa một hoặc nhiều từ vựng khỏi bộ từ vựng.
 */
const removeWordsSchema = z.object({
  wordIds: z
    .array(z.string().uuid("ID từ vựng không hợp lệ").min(1))
    .min(1, "Vui lòng gửi danh sách ID từ vựng cần xóa")
    .max(100, "Số từ vựng xóa không được vượt quá 100 từ mỗi lần"),
});

module.exports = {
  createVocabularySetSchema,
  updateVocabularySetSchema,
  addWordsSchema,
  generateWordsSchema,
  removeWordsSchema,
};
