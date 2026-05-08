const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/listening-lessons/:lessonId/questions
 * Tạo mới một câu hỏi.
 */
const createQuestionSchema = z.object({
  lesson_id: z.string().uuid("lesson_id phải là UUID hợp lệ").optional(),
  question: z
    .string()
    .min(1, "Vui lòng nhập nội dung câu hỏi")
    .max(2000, "Câu hỏi không được dài quá 2000 ký tự")
    .trim(),
  option_a: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  option_b: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  option_c: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  option_d: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  correct_answer: z
    .string()
    .min(1, "Vui lòng cung cấp đáp án đúng")
    .max(1, "Đáp án đúng phải là A, B, C hoặc D")
    .toUpperCase()
    .refine((val) => ["A", "B", "C", "D"].includes(val), {
      message: "Đáp án đúng phải là A, B, C hoặc D",
    }),
  explain: z
    .string()
    .max(2000, "Giải thích không được dài quá 2000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
});

/**
 * Schema validate body cho POST /api/v1/listening-lessons/:lessonId/questions/bulk
 * Tạo nhiều câu hỏi cùng lúc.
 */
const createManyQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .min(1, "Vui lòng nhập nội dung câu hỏi")
          .max(2000, "Câu hỏi không được dài quá 2000 ký tự")
          .trim(),
        option_a: z
          .string()
          .max(1000, "Đáp án không được dài quá 1000 ký tự")
          .optional()
          .transform((val) => val?.trim()),
        option_b: z
          .string()
          .max(1000, "Đáp án không được dài quá 1000 ký tự")
          .optional()
          .transform((val) => val?.trim()),
        option_c: z
          .string()
          .max(1000, "Đáp án không được dài quá 1000 ký tự")
          .optional()
          .transform((val) => val?.trim()),
        option_d: z
          .string()
          .max(1000, "Đáp án không được dài quá 1000 ký tự")
          .optional()
          .transform((val) => val?.trim()),
        correct_answer: z
          .string()
          .min(1, "Vui lòng cung cấp đáp án đúng")
          .max(1, "Đáp án đúng phải là A, B, C hoặc D")
          .toUpperCase()
          .refine((val) => ["A", "B", "C", "D"].includes(val), {
            message: "Đáp án đúng phải là A, B, C hoặc D",
          }),
        explain: z
          .string()
          .max(2000, "Giải thích không được dài quá 2000 ký tự")
          .optional()
          .transform((val) => val?.trim()),
      })
    )
    .min(1, "Vui lòng cung cấp danh sách câu hỏi")
    .max(50, "Mỗi lần tạo tối đa 50 câu hỏi"),
});

/**
 * Schema validate body cho PATCH /api/v1/listening-questions/:id
 * Cập nhật câu hỏi.
 */
const updateQuestionSchema = z.object({
  question: z
    .string()
    .min(1, "Câu hỏi không được để trống")
    .max(2000, "Câu hỏi không được dài quá 2000 ký tự")
    .trim()
    .optional(),
  option_a: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  option_b: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  option_c: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  option_d: z
    .string()
    .max(1000, "Đáp án không được dài quá 1000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
  correct_answer: z
    .string()
    .min(1, "Vui lòng cung cấp đáp án đúng")
    .max(1, "Đáp án đúng phải là A, B, C hoặc D")
    .toUpperCase()
    .refine((val) => ["A", "B", "C", "D"].includes(val), {
      message: "�áp án đúng phải là A, B, C hoặc D",
    })
    .optional(),
  explain: z
    .string()
    .max(2000, "Giải thích không được dài quá 2000 ký tự")
    .optional()
    .transform((val) => val?.trim()),
});

/**
 * Schema validate body cho DELETE /api/v1/listening-questions/bulk
 * Xóa nhiều câu hỏi.
 */
const deleteManyQuestionsSchema = z.object({
  ids: z
    .array(z.string().uuid("id phải là UUID hợp lệ"))
    .min(1, "Vui lòng cung cấp danh sách câu hỏi cần xóa")
    .max(100, "Mỗi lần xóa tối đa 100 câu hỏi"),
});

module.exports = {
  createQuestionSchema,
  createManyQuestionsSchema,
  updateQuestionSchema,
  deleteManyQuestionsSchema,
};
