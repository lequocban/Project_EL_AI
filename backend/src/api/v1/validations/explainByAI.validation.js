const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/explain-by-ai
 * Giải thích chi tiết đáp án bài luyện đọc / luyện nghe bằng AI.
 */
const explainByAISchema = z.object({
  lessonType: z
    .enum(["reading", "listening"], {
      errorMap: () => ({ message: "lessonType phải là 'reading' hoặc 'listening'" }),
    }),
  content: z
    .string()
    .min(1, "Nội dung bài đọc hoặc transcript không được để trống")
    .max(10000, "Nội dung không được dài quá 10000 ký tự")
    .trim(),
  viTranslation: z
    .string()
    .min(1, "Bản dịch tiếng Việt không được để trống")
    .max(10000, "Bản dịch không được dài quá 10000 ký tự")
    .optional()
    .default("")
    .transform((val) => val.trim()),
  question: z
    .string()
    .min(1, "Câu hỏi không được để trống")
    .max(2000, "Câu hỏi không được dài quá 2000 ký tự")
    .trim(),
  allAnswers: z
    .object({
      a: z.string().min(1).max(500),
      b: z.string().min(1).max(500),
      c: z.string().min(1).max(500),
      d: z.string().min(1).max(500),
    })
    .strict(),
  userAnswer: z
    .string()
    .min(1, "Đáp án người dùng không được để trống")
    .max(10, "Đáp án không hợp lệ")
    .trim()
    .transform((val) => val.toUpperCase()),
  correctAnswer: z
    .string()
    .min(1, "Đáp án đúng không được để trống")
    .max(10, "Đáp án không hợp lệ")
    .trim()
    .transform((val) => val.toUpperCase()),
});

module.exports = {
  explainByAISchema,
};
