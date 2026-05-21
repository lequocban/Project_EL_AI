const listeningLessonService = require("../../services/listeningLesson.service");
const { parsePagination } = require("../../../../utils/pagination");
const { success } = require("../../../../utils/responseHandler");

/**
 * GET /api/v1/admin/listening-lessons/pending
 * Lấy danh sách bài đang chờ duyệt public.
 */
const getPendingPublic = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await listeningLessonService.getPendingPublicLessons({ keyword, page, limit });

    return success(res, result, "Lấy danh sách bài chờ duyệt thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/admin/listening-lessons/:id/approve
 * Duyệt public bài luyện nghe.
 */
const approvePublic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await listeningLessonService.approvePublic(id);

    return success(res, result, "Duyệt public bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/admin/listening-lessons/:id/reject
 * Từ chối duyệt public bài luyện nghe.
 */
const rejectPublic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await listeningLessonService.rejectPublic(id);

    return success(res, result, "Từ chối duyệt bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPendingPublic,
  approvePublic,
  rejectPublic,
};
