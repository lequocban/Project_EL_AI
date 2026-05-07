const { z } = require("zod");

// Schema base cho submit practice (validation ở controller vì cần check theo type)
const submitPracticeSchema = z.object({
  setId: z.string().uuid("setId phải là UUID hợp lệ"),
  type: z.enum(["quiz", "listening_quiz", "translate_write", "listen_write"], {
    errorMap: () => ({ message: "type phải là một trong: quiz, listening_quiz, translate_write, listen_write" }),
  }),
  timeSpent: z.number().int("timeSpent phải là số nguyên").min(0, "timeSpent không được âm").optional().default(0),
  answers: z.array(z.unknown()).min(1, "Danh sách đáp án không được rỗng"),
});

module.exports = {
  submitPracticeSchema,
};
