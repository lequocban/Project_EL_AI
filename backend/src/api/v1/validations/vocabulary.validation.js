const { z } = require("zod");

/**
 * Schema validate body cho POST /api/v1/vocabulary/lookup
 * Body gửi lên là một object có field "word".
 */
const lookupWordSchema = z.object({
  word: z
    .string()
    .min(1, "Vui lòng nhập từ cần tra")
    .max(100, "Từ không được dài quá 100 ký tự")
    .trim()
    .transform((val) => val.toLowerCase()),
});

module.exports = { lookupWordSchema };
