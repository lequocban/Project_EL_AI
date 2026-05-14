const listeningLessonService = require("../../services/listeningLesson.service");
const { parsePagination } = require("../../../../utils/pagination");
const { success } = require("../../../../utils/responseHandler");

/**
 * POST /api/v1/listening-lessons
 * Tạo bài luyện nghe mới.
 */
const createLesson = async (req, res, next) => {
  try {
    const { title, audioUrl, transcript, viTranslation } = req.body;
    const createdBy = req.user.id;

    const result = await listeningLessonService.createLesson({
      title,
      audioUrl,
      transcript,
      viTranslation,
      createdBy,
    });

    return success(res, result, "Tạo bài luyện nghe thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/listening-lessons/:id
 * Cập nhật bài luyện nghe (không cho phép cập nhật status).
 */
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, audioUrl, transcript, viTranslation } = req.body;

    const result = await listeningLessonService.updateLesson(id, userId, {
      title,
      audioUrl,
      transcript,
      viTranslation,
    });

    return success(res, result, "Cập nhật bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/listening-lessons/:id
 * Xóa bài luyện nghe (xóa mềm).
 */
const removeLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await listeningLessonService.deleteLesson(id, userId);

    return success(res, result, "Xóa bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/listening-lessons/public
 * Lấy danh sách bài luyện nghe public (phân trang, tìm kiếm, sắp xếp).
 */
const getPublicLessons = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "";

    const result = await listeningLessonService.getPublicLessons({ keyword, page, limit, sortField, sortOrder });

    return success(res, result, "Lấy danh sách bài luyện nghe public thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/listening-lessons/my
 * Lấy danh sách bài luyện nghe do user tạo (phân trang, tìm kiếm, sắp xếp).
 */
const getMyLessons = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "";

    const result = await listeningLessonService.getMyLessons(userId, { keyword, page, limit, sortField, sortOrder });

    return success(res, result, "Lấy danh sách bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/listening-lessons/:id
 * Lấy chi tiết bài luyện nghe.
 */
const getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await listeningLessonService.getDetail(id, userId);

    return success(res, result, "Lấy chi tiết bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/listening-lessons/:id/request-public
 * Yêu cầu public bài luyện nghe.
 */
const requestPublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await listeningLessonService.requestPublic(id, userId);

    return success(res, result, "Yêu cầu public bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/listening-lessons/:id/make-private
 * Chuyển bài luyện nghe từ public thành private.
 */
const makePrivate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await listeningLessonService.makePrivate(id, userId);

    return success(res, result, "Chuyển bài luyện nghe thành private thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/listening-lessons/:id/set-status
 * Thay đổi trạng thái bài luyện nghe (chỉ dành cho content_manager hoặc admin, và phải là chủ sở hữu).
 * Cho phép chuyển trực tiếp giữa private và public mà không cần qua kiểm duyệt.
 */
const setStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const result = await listeningLessonService.setStatus(id, userId, status);

    return success(res, result, "Thay đổi trạng thái bài luyện nghe thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createLesson,
  updateLesson,
  removeLesson,
  getPublicLessons,
  getMyLessons,
  getDetail,
  requestPublic,
  makePrivate,
  setStatus,
};
