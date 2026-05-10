const readingLessonModel = require("../repositories/readingLesson.model");
const readingQuestionModel = require("../repositories/readingQuestion.model");
const aiService = require("../services/ai.service");
const { AppError } = require("../../../utils/appError");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");

/**
 * Format response reading lesson (lite, không có questions).
 * @param {Object} lesson
 * @returns {Object}
 */
const formatLesson = (lesson) => ({
  id: lesson.id,
  title: lesson.title,
  content: lesson.content,
  viTranslation: lesson.vi_translation,
  status: lesson.status,
  createdBy: lesson.created_by,
  createdAt: lesson.created_at,
});

/**
 * Format response chi tiết lesson (có kèm danh sách câu hỏi).
 * @param {Object} lesson
 * @param {Array} questions
 * @returns {Object}
 */
const formatLessonDetail = (lesson, questions) => ({
  id: lesson.id,
  title: lesson.title,
  content: lesson.content,
  viTranslation: lesson.vi_translation,
  status: lesson.status,
  createdBy: lesson.created_by,
  createdAt: lesson.created_at,
  questions: questions.map((q) => ({
    id: q.id,
    question: q.question,
    optionA: q.option_a,
    optionB: q.option_b,
    optionC: q.option_c,
    optionD: q.option_d,
    correctAnswer: q.correct_answer,
    explain: q.explain,
    createdAt: q.created_at,
  })),
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
 * Kiểm tra trạng thái hợp lệ.
 * @param {string} status
 */
const isValidStatus = (status) => ["private", "req_public", "public"].includes(status);

/**
 * Tạo bài luyện đọc bằng AI.
 * Luồng:
 * 1. Gọi AI sinh bài đọc tiếng Anh + bản dịch tiếng Việt
 * 2. Lưu bài đọc vào database
 * 3. Gọi AI sinh câu hỏi dựa trên bài đọc
 * 4. Lưu câu hỏi vào database
 */
const generateWithAI = async ({ title, topic, questionCount, createdBy }) => {
  if (!title || !title.trim()) {
    throw new AppError("Vui lòng nhập tiêu đề bài luyện đọc", 400);
  }

  if (!topic || !topic.trim()) {
    throw new AppError("Vui lòng nhập chủ đề bài đọc", 400);
  }

  if (title.trim().length > 255) {
    throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
  }

  const safeCount = Math.min(Math.max(1, parseInt(questionCount, 10) || 5), 5);

  // Bước 1: Gọi AI sinh bài đọc
  const { content, viTranslation } = await aiService.generateReadingLessonByAI(title, topic);

  // Bước 2: Tạo bài luyện đọc trong database
  const lesson = await readingLessonModel.create({
    title: title.trim(),
    content: content,
    vi_translation: viTranslation,
    status: "private",
    created_by: createdBy,
  });

  // Bước 3: Gọi AI sinh câu hỏi
  const questions = await aiService.generateReadingQuestionsByAI(content, viTranslation, safeCount);

  // Bước 4: Lưu câu hỏi vào database
  const savedQuestions = await readingQuestionModel.createMany(lesson.id, questions);

  return formatLessonDetail(lesson, savedQuestions);
};

/**
 * Tạo bài luyện đọc mới.
 * Mặc định status = 'private'.
 */
const createLesson = async ({ title, content, vi_translation, status, createdBy }) => {
  if (!title || !title.trim()) {
    throw new AppError("Vui lòng nhập tiêu đề bài luyện đọc", 400);
  }

  if (title.trim().length > 255) {
    throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
  }

  if (content && content.trim().length > 50000) {
    throw new AppError("Nội dung bài luyện đọc không được dài quá 50000 ký tự", 400);
  }

  if (vi_translation && vi_translation.trim().length > 50000) {
    throw new AppError("Bản dịch tiếng Việt không được dài quá 50000 ký tự", 400);
  }

  if (status && !isValidStatus(status)) {
    throw new AppError("Trạng thái không hợp lệ. Chỉ chấp nhận: private, req_public, public", 400);
  }

  const lesson = await readingLessonModel.create({
    title: title.trim(),
    content: content?.trim() || null,
    vi_translation: vi_translation?.trim() || null,
    status: status || "private",
    created_by: createdBy,
  });

  return formatLesson(lesson);
};

/**
 * Cập nhật bài luyện đọc.
 * Chỉ chủ sở hữu mới được cập nhật.
 */
const updateLesson = async (id, userId, { title, content, vi_translation, status }) => {
  const lesson = await readingLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền cập nhật bài luyện đọc này", 403);
  }

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new AppError("Tiêu đề không được để trống", 400);
    }
    if (title.trim().length > 255) {
      throw new AppError("Tiêu đề không được dài quá 255 ký tự", 400);
    }
  }

  if (content !== undefined && content && content.trim().length > 50000) {
    throw new AppError("Nội dung bài luyện đọc không được dài quá 50000 ký tự", 400);
  }

  if (vi_translation !== undefined && vi_translation && vi_translation.trim().length > 50000) {
    throw new AppError("Bản dịch tiếng Việt không được dài quá 50000 ký tự", 400);
  }

  if (status !== undefined && !isValidStatus(status)) {
    throw new AppError("Trạng thái không hợp lệ. Chỉ chấp nhận: private, req_public, public", 400);
  }

  const updated = await readingLessonModel.update(id, {
    title: title?.trim(),
    content: content?.trim(),
    vi_translation: vi_translation?.trim(),
    status,
  });

  return formatLesson(updated);
};

/**
 * Xóa mềm bài luyện đọc.
 * Chỉ chủ sở hữu mới được xóa.
 */
const deleteLesson = async (id, userId) => {
  const lesson = await readingLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền xóa bài luyện đọc này", 403);
  }

  const deleted = await readingLessonModel.softDelete(id);
  return formatLesson(deleted);
};

/**
 * Lấy chi tiết bài luyện đọc (kèm danh sách câu hỏi).
 * Bài public: ai cũng xem được.
 * Bài private / req_public: chỉ chủ sở hữu xem được.
 */
const getDetail = async (id, userId) => {
  const lesson = await readingLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.status !== "public" && lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền xem bài luyện đọc này", 403);
  }

  const questions = await readingQuestionModel.findByLessonId(id);

  return formatLessonDetail(lesson, questions);
};

/**
 * Lấy danh sách bài luyện đọc public (phân trang, tìm kiếm, sắp xếp).
 */
const getPublicLessons = async ({ keyword, page, limit, sortField, sortOrder }) => {
  const { data, total } = await readingLessonModel.getPublicLessons({ keyword, page, limit, sortField, sortOrder });

  const items = data.map(formatLesson);
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Lấy danh sách bài luyện đọc của user (phân trang, tìm kiếm, sắp xếp).
 */
const getMyLessons = async (userId, { keyword, page, limit, sortField, sortOrder }) => {
  const { data, total } = await readingLessonModel.getMyLessons(userId, { keyword, page, limit, sortField, sortOrder });

  const items = data.map(formatListItem);
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Yêu cầu public bài luyện đọc.
 * Chỉ bài ở trạng thái 'private' mới được yêu cầu.
 */
const requestPublic = async (id, userId) => {
  const lesson = await readingLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền yêu cầu public bài luyện đọc này", 403);
  }

  if (lesson.status !== "private") {
    throw new AppError("Chỉ bài luyện đọc ở trạng thái private mới có thể yêu cầu public", 400);
  }

  const updated = await readingLessonModel.updateStatus(id, "req_public");
  return formatLesson(updated);
};

/**
 * Chuyển bài luyện đọc về chế độ riêng tư.
 * Bài phải ở trạng thái 'public' hoặc 'req_public' mới được chuyển về private.
 * Chỉ chủ sở hữu mới thực hiện được.
 */
const makePrivate = async (id, userId) => {
  const lesson = await readingLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền thay đổi trạng thái bài luyện đọc này", 403);
  }

  if (lesson.status === "private") {
    throw new AppError("Bài luyện đọc đã ở chế độ riêng tư", 400);
  }

  const updated = await readingLessonModel.updateStatus(id, "private");
  return formatLesson(updated);
};

/**
 * Lấy danh sách bài đang chờ duyệt public (dùng cho content_manager/admin).
 */
const getPendingPublicLessons = async ({ keyword, page, limit }) => {
  const { data, total } = await readingLessonModel.getPendingPublicLessons({ keyword, page, limit });

  const items = data.map(formatListItem);
  return buildPaginationResponse(items, { page, limit, total });
};

/**
 * Duyệt public bài luyện đọc (content_manager/admin).
 */
const approvePublic = async (id) => {
  const lesson = await readingLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.status !== "req_public") {
    throw new AppError("Bài luyện đọc không ở trạng thái chờ duyệt", 400);
  }

  const updated = await readingLessonModel.updateStatus(id, "public");
  return formatLesson(updated);
};

/**
 * Từ chối duyệt public bài luyện đọc (content_manager/admin).
 */
const rejectPublic = async (id) => {
  const lesson = await readingLessonModel.findById(id);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.status !== "req_public") {
    throw new AppError("Bài luyện đọc không ở trạng thái chờ duyệt", 400);
  }

  const updated = await readingLessonModel.updateStatus(id, "private");
  return formatLesson(updated);
};

module.exports = {
  generateWithAI,
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
};
