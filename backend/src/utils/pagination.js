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

module.exports = { parsePagination };
