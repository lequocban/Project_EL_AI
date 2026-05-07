const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/reading-lessons/generate-with-ai
 * Tạo bài luyện đọc bằng AI.
 */
const generateWithAISchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bài luyện đọc")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim(),
  topic: z
    .string()
    .min(1, "Vui lòng nhập chủ đề bài đọc")
    .max(500, "Chủ đề không được dài quá 500 ký tự")
    .trim(),
  questionCount: z
    .number({
      invalid_type_error: "Số câu hỏi phải là số",
    })
    .int("Số câu hỏi phải là số nguyên")
    .min(1, "Số câu hỏi tối thiểu là 1")
    .max(5, "Số câu hỏi tối đa là 5")
    .default(5),
});

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
  generateWithAISchema,
  createReadingLessonSchema,
  updateReadingLessonSchema,
};
