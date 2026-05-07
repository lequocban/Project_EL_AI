const { z } = require("zod");
const { AppError } = require("../../../utils/appError");

const submitPracticeSchema = z.object({
  setId: z.string().uuid("setId phải là UUID hợp lệ"),
  type: z.enum(["quiz", "listening_quiz", "translate_write", "listen_write"], {
    errorMap: () => ({
      message: "type phải là một trong: quiz, listening_quiz, translate_write, listen_write",
    }),
  }),
  timeSpent: z
    .number()
    .int("timeSpent phải là số nguyên")
    .min(0, "timeSpent không được âm")
    .optional()
    .default(0),
  answers: z.array(z.unknown()).min(1, "Danh sách đáp án không được rỗng"),
});

const choiceAnswerSchema = z.object({
  wordId: z.string().uuid("wordId phải là UUID hợp lệ"),
  answer: z.string().min(1, "Đáp án không được rỗng"),
});

const writeAnswerSchema = z.object({
  wordId: z.string().uuid("wordId phải là UUID hợp lệ"),
  answer: z.string().min(1, "Đáp án không được rỗng"),
});

/**
 * Validate danh sách đáp án theo loại bài tập.
 * @param {string} type - quiz | listening_quiz | translate_write | listen_write
 * @param {Array} answers - Danh sách đáp án từ client
 * @returns {Array} - Danh sách đáp án đã validate
 */
const validateAnswers = (type, answers) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new AppError("Danh sách đáp án không được rỗng", 400);
  }

  const schema = type === "quiz" || type === "listening_quiz"
    ? choiceAnswerSchema
    : writeAnswerSchema;

  const errors = [];
  const validatedAnswers = [];

  for (let i = 0; i < answers.length; i++) {
    const result = schema.safeParse(answers[i]);
    if (!result.success) {
      errors.push({
        index: i,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    } else {
      validatedAnswers.push(result.data);
    }
  }

  if (errors.length > 0) {
    const err = new AppError("Dữ liệu đáp án không hợp lệ", 400);
    err.errors = errors;
    throw err;
  }

  return validatedAnswers;
};

module.exports = {
  submitPracticeSchema,
  validateAnswers,
};
