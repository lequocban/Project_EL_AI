const { z } = require("zod");

const getAllUsersSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, "page phải lớn hơn hoặc bằng 1"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val >= 1 && val <= 100, "limit phải từ 1 đến 100"),
});

module.exports = {
  getAllUsersSchema,
};
