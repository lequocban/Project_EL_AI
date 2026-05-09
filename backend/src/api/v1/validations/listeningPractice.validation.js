const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/listening-lessons/:lessonId/practice/submit
 * Nộp bài luyện nghe.
 */
const submitListeningPracticeSchema = z.object({
  lessonId: z.string().uuid("lessonId phải là UUID hợp lệ").optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid("questionId phải là UUID hợp lệ"),
        answer: z
          .string()
          .min(1, "Đáp án không được rỗng")
          .max(10, "Đáp án không được dài quá 10 ký tự"),
      })
    )
    .min(1, "Danh sách đáp án không được rỗng"),
});

module.exports = {
  submitListeningPracticeSchema,
};
