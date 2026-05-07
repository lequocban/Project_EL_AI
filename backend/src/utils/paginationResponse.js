/**
 * Xây dựng response phân trang thống nhất cho toàn bộ service.
 * @param {Array} items - Danh sách items đã enrich
 * @param {{ page: number, limit: number, total: number, maxLimit?: number }} options
 * @returns {{ items: Array, pagination: { page, limit, total, totalPages } }}
 */
const buildPaginationResponse = (items, { page, limit, total, maxLimit = 15 }) => {
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const totalPages = Math.ceil(total / safeLimit);
  return {
    items,
    pagination: {
      page,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
};

module.exports = { buildPaginationResponse };
