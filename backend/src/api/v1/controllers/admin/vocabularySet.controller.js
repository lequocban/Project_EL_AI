const vocabularySetService = require("../../services/vocabularySet.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * Parse pagination query params.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(15, Math.max(1, parseInt(query.limit, 10) || 15));
  return { page, limit };
};

/**
 * GET /api/v1/admin/vocabulary-sets/pending
 * Lấy danh sách bộ từ vựng đang chờ duyệt public (có phân trang, tìm kiếm).
 */
const getPendingPublicSets = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await vocabularySetService.getPendingPublicSets({ keyword, page, limit });

    return success(res, result, "Lấy danh sách bộ từ vựng chờ duyệt thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/admin/vocabulary-sets/:id/approve
 * Duyệt public một bộ từ vựng (chuyển status từ req_public thành public).
 */
const approvePublic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await vocabularySetService.approvePublic(id);

    return success(res, result, "Duyệt public bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/admin/vocabulary-sets/:id/reject
 * Từ chối duyệt public một bộ từ vựng (chuyển status từ req_public thành private).
 */
const rejectPublic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await vocabularySetService.rejectPublic(id);

    return success(res, result, "Từ chối duyệt bộ từ vựng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPendingPublicSets,
  approvePublic,
  rejectPublic,
};
