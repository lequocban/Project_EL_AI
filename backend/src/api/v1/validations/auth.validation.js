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

const requestOtpSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .transform((val) => val.toLowerCase().trim()),
});

const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .transform((val) => val.toLowerCase().trim()),
  otp: z
    .string()
    .length(6, "Mã OTP phải có 6 chữ số")
    .regex(/^\d{6}$/, "Mã OTP phải là 6 chữ số"),
  newPassword: z
    .string()
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu mới phải có ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Mật khẩu mới phải có ít nhất 1 chữ số"),
});

const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .transform((val) => val.toLowerCase().trim()),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z
    .string()
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu mới phải có ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Mật khẩu mới phải có ít nhất 1 chữ số"),
});

module.exports = {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
