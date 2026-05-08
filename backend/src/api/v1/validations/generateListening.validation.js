const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/listening-lessons/generate-ai
 * Tạo bài luyện nghe bằng AI.
 */
const createListeningByAISchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bài luyện nghe")
    .max(255, "Tiêu đề không được dài quá 255 ký tự")
    .trim(),
  topic: z
    .string()
    .min(1, "Vui lòng nhập chủ đề bài luyện nghe")
    .max(500, "Chủ đề không được dài quá 500 ký tự")
    .trim(),
  questionCount: z
    .number()
    .int("Số câu hỏi phải là số nguyên")
    .min(1, "Tối thiểu 1 câu hỏi")
    .max(5, "Tối đa 5 câu hỏi")
    .optional()
    .default(5),
});

module.exports = {
  createListeningByAISchema,
};
