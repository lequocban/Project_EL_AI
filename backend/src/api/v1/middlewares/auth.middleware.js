const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

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
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Bạn cần đăng nhập để thực hiện thao tác này", 401));
  }

  const roleIds = req.user?.app_metadata?.roleIds || [];
  if (!roleIds.includes(3)) {
    return next(new AppError("Bạn không có quyền thực hiện thao tác này", 403));
  }

  return next();
};

module.exports = { verifyToken, requireAuth, requireAdmin };
