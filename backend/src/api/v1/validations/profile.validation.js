const { z } = require("zod");

/**
 * Schema validate body cho PUT /api/v1/profile/me
 * Chỉ cho phép cập nhật userName và dayOfBirth.
 * Email và password KHÔNG được phép cập nhật qua endpoint này.
 */
const updateProfileSchema = z
  .object({
    userName: z
      .string()
      .min(2, "Tên hiển thị phải có ít nhất 2 ký tự")
      .max(50, "Tên hiển thị không được vượt quá 50 ký tự")
      .trim()
      .optional(),
    dayOfBirth: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "dayOfBirth phải có định dạng DD/MM/YYYY")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Vui lòng cung cấp ít nhất một trường cần cập nhật",
  });

module.exports = { updateProfileSchema };
