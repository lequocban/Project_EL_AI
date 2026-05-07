const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/reading-lessons
 * Tạo mới bài luyện đọc.
 */
const createReadingLessonSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bài luyện đọc")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim(),
  content: z
    .string()
    .max(50000, "Nội dung không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  vi_translation: z
    .string()
    .max(50000, "Bản dịch tiếng Việt không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
});

/**
 * Schema validate body cho PATCH /api/v1/reading-lessons/:id
 * Cập nhật bài luyện đọc.
 */
const updateReadingLessonSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim()
    .optional(),
  content: z
    .string()
    .max(50000, "Nội dung không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  vi_translation: z
    .string()
    .max(50000, "Bản dịch tiếng Việt không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
});

module.exports = {
  createReadingLessonSchema,
  updateReadingLessonSchema,
};
