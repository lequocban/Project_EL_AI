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
  search: z.string().optional(),
  sortField: z
    .string()
    .optional()
    .refine(
      (val) => !val || ["created_at", "email", "status"].includes(val),
      "sortField chỉ được là 'created_at', 'email' hoặc 'status'"
    ),
  sortOrder: z
    .string()
    .optional()
    .refine(
      (val) => !val || ["asc", "desc"].includes(val.toLowerCase()),
      "sortOrder chỉ được là 'asc' hoặc 'desc'"
    ),
  status: z
    .string()
    .optional()
    .refine(
      (val) => !val || ["active", "inactive"].includes(val),
      "status chỉ được là 'active' hoặc 'inactive'"
    ),
  role: z
    .string()
    .optional()
    .refine(
      (val) => !val || ["user", "content_manager", "admin"].includes(val),
      "role chỉ được là 'user', 'content_manager' hoặc 'admin'"
    ),
});

const getUserDetailSchema = z.object({
  id: z.string().uuid("id phải là UUID hợp lệ"),
});

const deleteUserSchema = z.object({
  id: z.string().uuid("id phải là UUID hợp lệ"),
});

const updateUserStatusSchema = z.object({
  userIds: z
    .array(z.string().uuid("userIds phải là mảng UUID hợp lệ"))
    .min(1, "Phải có ít nhất 1 userId")
    .max(100, "Tối đa 100 userId cùng lúc"),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "status phải là 'active' hoặc 'inactive'" }),
  }),
});

const updateUserRoleSchema = z.object({
  userId: z.string().uuid("userId phải là UUID hợp lệ"),
  role: z.enum(["user", "content_manager", "admin"], {
    errorMap: () => ({ message: "role phải là 'user', 'content_manager' hoặc 'admin'" }),
  }),
  action: z.enum(["grant", "revoke"], {
    errorMap: () => ({ message: "action phải là 'grant' hoặc 'revoke'" }),
  }),
});

module.exports = {
  getAllUsersSchema,
  getUserDetailSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  deleteUserSchema,
};
