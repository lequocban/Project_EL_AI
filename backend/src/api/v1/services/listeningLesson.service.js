const listeningLessonModel = require("../repositories/listeningLesson.model");
const listeningQuestionService = require("./listeningQuestion.service");
const { AppError } = require("../../../utils/appError");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");

/**
 * Format response listening lesson.
 * @param {Object} lesson
 * @returns {Object}
 */
const formatLesson = (lesson) => ({
  id: lesson.id,
  title: lesson.title,
  audioUrl: lesson.audio_url,
  transcript: lesson.transcript,
  viTranslation: lesson.vi_translation,
  status: lesson.status,
  createdBy: lesson.created_by,
  createdAt: lesson.created_at,
});

/**
 * Format item cho danh sách (lite version, không có content).
 * @param {Object} item
 * @returns {Object}
 */
const formatListItem = (item) => ({
  id: item.id,
  title: item.title,
  status: item.status,
  createdAt: item.created_at,
});

/**
 * Tạo bài luyện nghe mới.
 * Mặc định status = 'private'.
 */
const createLesson = async ({ title, audioUrl, transcript, viTranslation, createdBy }) => {
  if (!title || !title.trim()) {
    throw new AppError("Vui lòng nhập tiêu đề bài luyện nghe", 400);
  }

  if (title.trim().length > 255) {
    throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
  }

  if (audioUrl && audioUrl.trim().length > 2048) {
    throw new AppError("Link audio không được dài quá 2048 ký tự", 400);
  }

  if (transcript && transcript.trim().length > 50000) {
    throw new AppError("Bản ghi không được dài quá 50000 ký tự", 400);
  }

  if (viTranslation && viTranslation.trim().length > 50000) {
    throw new AppError("Bản dịch tiếng Việt không được dài quá 50000 ký tự", 400);
  }

  const lesson = await listeningLessonModel.create({
    title: title.trim(),
    audio_url: audioUrl?.trim() || null,
    transcript: transcript?.trim() || null,
    vi_translation: viTranslation?.trim() || null,
    status: "private",
    created_by: createdBy,
  });

  return formatLesson(lesson);
};

/**
 * Cập nhật bài luyện nghe.
 * Chỉ chủ sở hữu mới được cập nhật.
 * Không cho phép cập nhật trường status qua API này.
 */
const updateLesson = async (id, userId, { title, audioUrl, transcript, viTranslation }) => {
  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền cập nhật bài luyện nghe này", 403);
  }

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new AppError("Tiêu đề không được để trống", 400);
    }
    if (title.trim().length > 255) {
      throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
    }
  }

  if (audioUrl !== undefined && audioUrl && audioUrl.trim().length > 2048) {
    throw new AppError("Link audio không được dài quá 2048 ký tự", 400);
  }

  if (transcript !== undefined && transcript && transcript.trim().length > 50000) {
    throw new AppError("Bản ghi không được dài quá 50000 ký tự", 400);
  }

  if (viTranslation !== undefined && viTranslation && viTranslation.trim().length > 50000) {
    throw new AppError("Bản dịch tiếng Việt không được dài quá 50000 ký tự", 400);
  }

  const updated = await listeningLessonModel.update(id, {
    title: title?.trim(),
    audio_url: audioUrl?.trim(),
    transcript: transcript?.trim(),
    vi_translation: viTranslation?.trim(),
  });

  return formatLesson(updated);
};

/**
 * Xóa mềm bài luyện nghe.
 * Chỉ chủ sở hữu mới được xóa.
 */
const deleteLesson = async (id, userId) => {
  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền xóa bài luyện nghe này", 403);
  }

  const deleted = await listeningLessonModel.softDelete(id);
  return formatLesson(deleted);
};

/**
 * Format response cho detail (full, có questions).
 * @param {Object} lesson
 * @param {Array} questions - đã được format sẵn từ listeningQuestionService
 * @returns {Object}
 */
const formatLessonDetail = (lesson, questions) => ({
  id: lesson.id,
  title: lesson.title,
  audioUrl: lesson.audio_url,
  transcript: lesson.transcript,
  viTranslation: lesson.vi_translation,
  status: lesson.status,
  createdBy: lesson.created_by,
  createdAt: lesson.created_at,
  questions: questions.map((q) => ({
    id: q.id,
    lessonId: q.lessonId,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    explain: q.explain,
    createdAt: q.createdAt,
  })),
});

/**
 * Lấy chi tiết bài luyện nghe (kèm danh sách câu hỏi).
 * Bài public: ai cũng xem được.
 * Bài private / req_public: chỉ chủ sở hữu xem được.
 */
const getDetail = async (id, userId) => {
  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.status !== "public" && lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền xem bài luyện nghe này", 403);
  }

  const questions = await listeningQuestionService.getQuestionsByLesson(userId, id);

  return formatLessonDetail(lesson, questions);
};

/**
 * Lấy danh sách bài luyện nghe public (phân trang, tìm kiếm, sắp xếp).
 */
const getPublicLessons = async ({ keyword, page, limit, sortField, sortOrder }) => {
  const { data, total } = await listeningLessonModel.getPublicLessons({ keyword, page, limit, sortField, sortOrder });

  const items = data.map(formatLesson);
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Lấy danh sách bài luyện nghe của user (phân trang, tìm kiếm, sắp xếp).
 */
const getMyLessons = async (userId, { keyword, page, limit, sortField, sortOrder }) => {
  const { data, total } = await listeningLessonModel.getMyLessons(userId, { keyword, page, limit, sortField, sortOrder });

  const items = data.map(formatListItem);
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Yêu cầu public bài luyện nghe.
 * Chỉ bài ở trạng thái 'private' mới được yêu cầu.
 */
const requestPublic = async (id, userId) => {
  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền yêu cầu public bài luyện nghe này", 403);
  }

  if (lesson.status !== "private") {
    throw new AppError("Chỉ bài luyện nghe ở trạng thái private mới có thể yêu cầu public", 400);
  }

  const updated = await listeningLessonModel.updateStatus(id, "req_public");
  return formatLesson(updated);
};

/**
 * Chuyển bài luyện nghe từ public thành private.
 * Chỉ chủ sở hữu mới được thực hiện.
 */
const makePrivate = async (id, userId) => {
  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền thay đổi trạng thái bài luyện nghe này", 403);
  }

  if (lesson.status !== "public") {
    throw new AppError("Chỉ bài luyện nghe ở trạng thái public mới có thể chuyển thành private", 400);
  }

  const updated = await listeningLessonModel.updateStatus(id, "private");
  return formatLesson(updated);
};

/**
 * Lấy danh sách bài đang chờ duyệt public (content_manager/admin).
 */
const getPendingPublicLessons = async ({ keyword, page, limit }) => {
  const { data, total } = await listeningLessonModel.getPendingPublicLessons({ keyword, page, limit });

  const items = data.map(formatListItem);
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Duyệt public bài luyện nghe (content_manager/admin).
 */
const approvePublic = async (id) => {
  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.status !== "req_public") {
    throw new AppError("Bài luyện nghe không ở trạng thái chờ duyệt", 400);
  }

  const updated = await listeningLessonModel.updateStatus(id, "public");
  return formatLesson(updated);
};

/**
 * Từ chối duyệt public bài luyện nghe (content_manager/admin).
 */
const rejectPublic = async (id) => {
  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.status !== "req_public") {
    throw new AppError("Bài luyện nghe không ở trạng thái chờ duyệt", 400);
  }

  const updated = await listeningLessonModel.updateStatus(id, "private");
  return formatLesson(updated);
};

/**
 * Thay đổi trạng thái bài luyện nghe (chỉ dành cho content_manager hoặc admin).
 * Cho phép chuyển trực tiếp giữa các trạng thái mà không cần qua kiểm duyệt.
 * Lưu ý: kiểm tra quyền manager/admin đã được middleware requireManagerOrAdmin xử lý.
 */
const setStatus = async (id, userId, newStatus) => {
  const allowedStatuses = ["private", "public"];
  if (!allowedStatuses.includes(newStatus)) {
    throw new AppError("Trạng thái không hợp lệ. Chỉ chấp nhận: private, public", 400);
  }

  const lesson = await listeningLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền thay đổi bài luyện nghe này", 403);
  }

  if (lesson.status === newStatus) {
    throw new AppError("Bài luyện nghe đã ở trạng thái này", 400);
  }

  const updated = await listeningLessonModel.updateStatus(id, newStatus);
  return formatLesson(updated);
};

module.exports = {
  createLesson,
  updateLesson,
  deleteLesson,
  getDetail,
  getPublicLessons,
  getMyLessons,
  requestPublic,
  makePrivate,
  getPendingPublicLessons,
  approvePublic,
  rejectPublic,
  formatLesson,
  formatLessonDetail,
  formatListItem,
  setStatus,
};
