const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/listening-lessons
 * Tạo mới bài luyện nghe.
 */
const createListeningLessonSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bài luyện nghe")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim(),
  audioUrl: z
    .string()
    .max(2048, "Link audio không được dài quá 2048 ký tự")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val?.trim())),
  transcript: z
    .string()
    .max(50000, "Bản ghi không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => (val === "" ? undefined : val?.trim())),
  viTranslation: z
    .string()
    .max(50000, "Bản dịch tiếng Việt không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => (val === "" ? undefined : val?.trim())),
});

/**
 * Schema validate body cho PATCH /api/v1/listening-lessons/:id
 * Cập nhật bài luyện nghe (không cho phép cập nhật status).
 */
const updateListeningLessonSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim()
    .optional(),
  audioUrl: z
    .string()
    .max(2048, "Link audio không được dài quá 2048 ký tự")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val?.trim())),
  transcript: z
    .string()
    .max(50000, "Bản ghi không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => (val === "" ? undefined : val?.trim())),
  viTranslation: z
    .string()
    .max(50000, "Bản dịch tiếng Việt không được dài quá 50000 ký tự")
    .optional()
    .transform((val) => (val === "" ? undefined : val?.trim())),
});

module.exports = {
  createListeningLessonSchema,
  updateListeningLessonSchema,
};
