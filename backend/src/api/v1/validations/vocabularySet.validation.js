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

module.exports = {
  createVocabularySetSchema,
  updateVocabularySetSchema,
  addWordsSchema,
};
