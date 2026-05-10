const router = require("express").Router();
const userController = require("../../controllers/admin/user.controller");
const { verifyToken, requireAuth, requireAdmin } = require("../../middlewares/auth.middleware");
const { validateQuery, validateParams, validateBody } = require("../../validations/validate");
const { getAllUsersSchema, getUserDetailSchema, updateUserStatusSchema, deleteUserSchema } = require("../../validations/user.validation");

// GET /api/v1/admin/users — Danh sách người dùng (role_id = 1)
router.get(
  "/",
  verifyToken,
  requireAuth,
  requireAdmin,
  validateQuery(getAllUsersSchema),
  userController.getAllUsers
);

// GET /api/v1/admin/users/:id — Chi tiết người dùng
router.get(
  "/:id",
  verifyToken,
  requireAuth,
  requireAdmin,
  validateParams(getUserDetailSchema),
  userController.getUserDetail
);

// PATCH /api/v1/admin/users/status — Cập nhật trạng thái một hoặc nhiều user
router.patch(
  "/status",
  verifyToken,
  requireAuth,
  requireAdmin,
  validateBody(updateUserStatusSchema),
  userController.updateUserStatus
);

// DELETE /api/v1/admin/users/:id — Xóa vĩnh viễn người dùng (chỉ inactive)
router.delete(
  "/:id",
  verifyToken,
  requireAuth,
  requireAdmin,
  validateParams(deleteUserSchema),
  userController.deleteUser
);

module.exports = router;
