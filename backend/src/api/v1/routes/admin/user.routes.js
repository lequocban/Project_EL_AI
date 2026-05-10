const router = require("express").Router();
const userController = require("../../controllers/admin/user.controller");
const { verifyToken, requireAuth, requireAdmin } = require("../../middlewares/auth.middleware");
const { validateQuery } = require("../../validations/validate");
const { getAllUsersSchema } = require("../../validations/user.validation");

// GET /api/v1/admin/users — Danh sách người dùng (role_id = 1)
router.get(
  "/",
  verifyToken,
  requireAuth,
  requireAdmin,
  validateQuery(getAllUsersSchema),
  userController.getAllUsers
);

module.exports = router;
