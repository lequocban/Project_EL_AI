/**
 * Parse pagination query params từ request.
 * @param {object} query - req.query object
 * @returns {{ page: number, limit: number }}
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(15, Math.max(1, parseInt(query.limit, 10) || 15));
  return { page, limit };
};

module.exports = { parsePagination };
