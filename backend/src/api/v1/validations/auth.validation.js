const { z } = require("zod");

const registerSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số"),
  userName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(50).trim().optional(),
  dayOfBirth: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "dayOfBirth phải có định dạng DD/MM/YYYY")
    .optional(),
});

const loginSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
