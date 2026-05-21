const readingLessonService = require("../../services/readingLesson.service");
const { parsePagination } = require("../../../../utils/pagination");
const { success } = require("../../../../utils/responseHandler");

/**
 * GET /api/v1/admin/reading-lessons/pending
 * Lấy danh sách bài đang chờ duyệt public.
 */
const getPendingPublic = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await readingLessonService.getPendingPublicLessons({ keyword, page, limit });

    return success(res, result, "Lấy danh sách bài chờ duyệt thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/admin/reading-lessons/:id/approve
 * Duyệt public bài luyện đọc.
 */
const approvePublic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await readingLessonService.approvePublic(id);

    return success(res, result, "Duyệt public bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/admin/reading-lessons/:id/reject
 * Từ chối duyệt public bài luyện đọc.
 */
const rejectPublic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await readingLessonService.rejectPublic(id);

    return success(res, result, "Từ chối duyệt bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPendingPublic,
  approvePublic,
  rejectPublic,
};
