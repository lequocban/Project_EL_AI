const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { getRoleIdsByUserIdService } = require("../repositories/role.model");

/**
 * Lấy token từ header Authorization: Bearer <token>
 */
const extractToken = (req) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
};

/**
 * Middleware: Verify JWT token từ Supabase.
 * Nếu token hợp lệ → gắn req.user và req.accessToken.
 * Nếu không có token → vẫn cho qua (dùng cho route public).
 */
const verifyToken = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    req.accessToken = null;
    return next();
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    req.user = null;
    req.accessToken = null;
    return next();
  }

  req.user = data.user;
  req.accessToken = token;
  return next();
};

/**
 * Middleware: Bắt buộc phải đăng nhập.
 * Dùng sau verifyToken cho các route cần xác thực.
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Bạn cần đăng nhập để thực hiện thao tác này", 401));
  }
  return next();
};

/**
 * Middleware: Chỉ cho phép admin (role_id = 3).
 * Dùng sau requireAuth.
 * Role được đọc trực tiếp từ database để đảm bảo đồng bộ với bảng user_roles.
 */
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Bạn cần đăng nhập để thực hiện thao tác này", 401));
  }

  const userId = req.user.id;
  const roleIds = await getRoleIdsByUserIdService(userId);

  if (!roleIds.includes(3)) {
    return next(new AppError("Bạn không có quyền thực hiện thao tác này", 403));
  }

  return next();
};

/**
 * Middleware: Chỉ cho phép content_manager (role_id = 2) hoặc admin (role_id = 3).
 * Dùng sau requireAuth.
 * Role được đọc trực tiếp từ database để đảm bảo đồng bộ với bảng user_roles.
 */
const requireManagerOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Bạn cần đăng nhập để thực hiện thao tác này", 401));
  }

  const userId = req.user.id;
  const roleIds = await getRoleIdsByUserIdService(userId);
  const allowedRoles = [2, 3]; // content_manager, admin

  const hasPermission = allowedRoles.some((roleId) => roleIds.includes(roleId));
  if (!hasPermission) {
    return next(new AppError("Bạn không có quyền thực hiện thao tác này", 403));
  }

  return next();
};

module.exports = { verifyToken, requireAuth, requireAdmin, requireManagerOrAdmin };
