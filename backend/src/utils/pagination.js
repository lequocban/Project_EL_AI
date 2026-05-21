/**
 * Parse pagination query params từ request.
 * @param {object} query - req.query object
 * @param {{ defaultLimit?: number, maxLimit?: number }} [options]
 * @returns {{ page: number, limit: number }}
 */
const parsePagination = (query, options = {}) => {
  const { defaultLimit = 15, maxLimit = 15 } = options;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

/**
 * Tính toán offset range cho phân trang Supabase.
 * @param {number} page - Trang bắt đầu từ 1
 * @param {number} limit - Số item mỗi trang
 * @param {number} [maxLimit] - Giới hạn tối đa
 * @returns {{ from: number, to: number, safeLimit: number }}
 */
const buildPaginationRange = (page, limit, maxLimit = 15) => {
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;
  return { from, to, safeLimit };
};

module.exports = { parsePagination, buildPaginationRange };
