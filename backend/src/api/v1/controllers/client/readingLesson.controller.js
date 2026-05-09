const readingLessonService = require("../../services/readingLesson.service");
const { parsePagination } = require("../../../../utils/pagination");
const { success } = require("../../../../utils/responseHandler");

/**
 * POST /api/v1/reading-lessons/generate-with-ai
 * Tạo bài luyện đọc bằng AI.
 */
const generateWithAI = async (req, res, next) => {
  try {
    const { title, topic, questionCount } = req.body;
    const createdBy = req.user.id;

    const result = await readingLessonService.generateWithAI({
      title,
      topic,
      questionCount,
      createdBy,
    });

    return success(res, result, "Tạo bài luyện đọc bằng AI thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/reading-lessons
 * Tạo bài luyện đọc mới.
 */
const createLesson = async (req, res, next) => {
  try {
    const { title, content, vi_translation } = req.body;
    const createdBy = req.user.id;

    const result = await readingLessonService.createLesson({
      title,
      content,
      vi_translation,
      status: "private",
      createdBy,
    });

    return success(res, result, "Tạo bài luyện đọc thành công", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/reading-lessons/:id
 * Cập nhật bài luyện đọc.
 */
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, vi_translation } = req.body;

    const result = await readingLessonService.updateLesson(id, userId, {
      title,
      content,
      vi_translation,
    });

    return success(res, result, "Cập nhật bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/reading-lessons/:id
 * Xóa bài luyện đọc (xóa mềm).
 */
const removeLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await readingLessonService.deleteLesson(id, userId);

    return success(res, result, "Xóa bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/reading-lessons/public
 * Lấy danh sách bài luyện đọc public (phân trang, tìm kiếm).
 */
const getPublicLessons = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await readingLessonService.getPublicLessons({ keyword, page, limit });

    return success(res, result, "Lấy danh sách bài luyện đọc public thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/reading-lessons/my
 * Lấy danh sách bài luyện đọc do user tạo (phân trang, tìm kiếm).
 */
const getMyLessons = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = parsePagination(req.query);
    const keyword = req.query.keyword || "";

    const result = await readingLessonService.getMyLessons(userId, { keyword, page, limit });

    return success(res, result, "Lấy danh sách bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/reading-lessons/:id
 * Lấy chi tiết bài luyện đọc.
 */
const getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await readingLessonService.getDetail(id, userId);

    return success(res, result, "Lấy chi tiết bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/reading-lessons/:id/request-public
 * Yêu cầu public bài luyện đọc.
 */
const requestPublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await readingLessonService.requestPublic(id, userId);

    return success(res, result, "Yêu cầu public bài luyện đọc thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/reading-lessons/:id/make-private
 * Chuyển bài luyện đọc về chế độ riêng tư.
 */
const makePrivate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await readingLessonService.makePrivate(id, userId);

    return success(res, result, "Chuyển bài luyện đọc về chế độ riêng tư thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateWithAI,
  createLesson,
  updateLesson,
  removeLesson,
  getPublicLessons,
  getMyLessons,
  getDetail,
  requestPublic,
  makePrivate,
};
