const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userName: z.string().min(2).max(50).optional(),
  dayOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dayOfBirth must be YYYY-MM-DD")
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

module.exports = {
  registerSchema,
  loginSchema,
};
