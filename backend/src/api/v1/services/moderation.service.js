const moderationModel = require("../repositories/moderation.model");
let readingLessonModel = null;
let listeningLessonModel = null;

try {
  readingLessonModel = require("../repositories/readingLesson.model");
} catch {
  // readingLesson.model chưa tồn tại
}

try {
  listeningLessonModel = require("../repositories/listeningLesson.model");
} catch {
  // listeningLesson.model chưa tồn tại
}

const vocabularySetModel = require("../repositories/vocabularySet.model");
const { AppError } = require("../../../utils/appError");

// Các loại content được hỗ trợ kiểm duyệt
const SUPPORTED_CONTENT_TYPES = ["vocabulary_set", "reading_lesson", "listening_lesson"];

// -------------------------------------------------------
// Tạo yêu cầu kiểm duyệt nội dung
// -------------------------------------------------------
const createModerationRequest = async (accessToken, userId, { contentType, contentId }) => {
  if (!contentType || !contentId) {
    throw new AppError("contentType và contentId là bắt buộc", 400);
  }

  // Kiểm tra content type có được hỗ trợ
  if (!SUPPORTED_CONTENT_TYPES.includes(contentType)) {
    throw new AppError(
      `Loại nội dung '${contentType}' chưa được hỗ trợ kiểm duyệt. Các loại được hỗ trợ: ${SUPPORTED_CONTENT_TYPES.join(", ")}`,
      400
    );
  }

  // Kiểm tra content tồn tại và user có quyền
  const contentOwnership = await verifyContentOwnership(contentType, contentId, userId);
  if (!contentOwnership.exists) {
    throw new AppError("Không tìm thấy nội dung", 404);
  }
  if (!contentOwnership.isOwner) {
    throw new AppError("Bạn không có quyền yêu cầu kiểm duyệt nội dung này", 403);
  }
  if (!contentOwnership.isPrivate) {
    throw new AppError(
      `Không thể yêu cầu kiểm duyệt nội dung ở trạng thái "${contentOwnership.currentStatus}". Chỉ nội dung ở trạng thái private mới được yêu cầu kiểm duyệt.`,
      400
    );
  }

  // Kiểm tra đã có yêu cầu pending hoặc approved chưa
  const existingRequest = await moderationModel.existsPendingRequest(
    accessToken,
    contentId,
    contentType,
    userId
  );
  if (existingRequest) {
    throw new AppError(
      "Bạn đã có yêu cầu kiểm duyệt đang chờ xử lý hoặc đã được duyệt cho nội dung này",
      409
    );
  }

  const request = await moderationModel.createModerationRequest(accessToken, {
    contentType,
    contentId,
    requestedBy: userId,
  });

  return formatModerationRequest(request, contentOwnership.content);
};

// -------------------------------------------------------
// Lấy danh sách yêu cầu kiểm duyệt của user
// -------------------------------------------------------
const getMyRequests = async (accessToken, userId, { keyword, status, page, limit }) => {
  const { data, total } = await moderationModel.getRequestsByUser(accessToken, userId, {
    keyword,
    status,
    page,
    limit,
  });

  // Lấy thông tin content cho mỗi request
  const enrichedData = await Promise.all(
    (data || []).map(async (req) => {
      const contentInfo = await getContentInfo(req.content_type, req.content_id);
      return formatModerationRequestListItem(req, contentInfo);
    })
  );

  return {
    data: enrichedData,
    total,
    page: page || 1,
    limit: limit || 15,
  };
};

// -------------------------------------------------------
// Kiểm tra quyền sở hữu content theo từng loại
// -------------------------------------------------------
/**
 * Xác minh user có quyền yêu cầu kiểm duyệt content không.
 * @param {string} contentType
 * @param {string} contentId
 * @param {string} userId
 * @returns {Promise<{exists: boolean, isOwner: boolean, isPrivate: boolean, currentStatus: string, content: Object|null}>}
 */
const verifyContentOwnership = async (contentType, contentId, userId) => {
  switch (contentType) {
    case "vocabulary_set":
      return verifyVocabularySetOwnership(contentId, userId);
    case "reading_lesson":
      return verifyReadingLessonOwnership(contentId, userId);
    case "listening_lesson":
      return verifyListeningLessonOwnership(contentId, userId);
    default:
      return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
};

const verifyVocabularySetOwnership = async (setId, userId) => {
  const set = await vocabularySetModel.findById(setId);
  if (!set) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  return {
    exists: true,
    isOwner: set.created_by === userId,
    isPrivate: set.status === "private",
    currentStatus: set.status,
    content: { id: set.id, title: set.title, description: set.description },
  };
};

const verifyReadingLessonOwnership = async (lessonId, userId) => {
  if (!readingLessonModel) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  const lesson = await readingLessonModel.findById(lessonId);
  if (!lesson) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  return {
    exists: true,
    isOwner: lesson.created_by === userId,
    isPrivate: lesson.is_public === false,
    currentStatus: lesson.is_public ? "public" : "private",
    content: { id: lesson.id, title: lesson.title },
  };
};

const verifyListeningLessonOwnership = async (lessonId, userId) => {
  if (!listeningLessonModel) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  const lesson = await listeningLessonModel.findById(lessonId);
  if (!lesson) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  return {
    exists: true,
    isOwner: lesson.created_by === userId,
    isPrivate: lesson.is_public === false,
    currentStatus: lesson.is_public ? "public" : "private",
    content: { id: lesson.id, title: lesson.title },
  };
};

// -------------------------------------------------------
// Lấy thông tin content theo type
// -------------------------------------------------------
const getContentInfo = async (contentType, contentId) => {
  switch (contentType) {
    case "vocabulary_set": {
      const set = await vocabularySetModel.getVocabularySetById(contentId);
      if (!set) return null;
      return { id: set.id, title: set.title, description: set.description };
    }
    case "reading_lesson": {
      if (!readingLessonModel) return null;
      const lesson = await readingLessonModel.findById(contentId);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title };
    }
    case "listening_lesson": {
      if (!listeningLessonModel) return null;
      const lesson = await listeningLessonModel.findById(contentId);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title };
    }
    default:
      return null;
  }
};

// -------------------------------------------------------
// Formatters
// -------------------------------------------------------
const formatModerationRequest = (request, contentInfo = null) => {
  return {
    id: request.id,
    contentType: request.content_type,
    contentId: request.content_id,
    status: request.status,
    requestedBy: request.requested_by,
    reviewedBy: request.reviewed_by || null,
    reviewedAt: request.reviewed_at || null,
    createdAt: request.created_at,
    content: contentInfo || null,
  };
};

const formatModerationRequestListItem = (request, contentInfo = null) => {
  return {
    id: request.id,
    contentType: request.content_type,
    contentId: request.content_id,
    status: request.status,
    requestedBy: request.requested_by,
    reviewedBy: request.reviewed_by || null,
    reviewedAt: request.reviewed_at || null,
    createdAt: request.created_at,
    content: contentInfo || null,
  };
};

module.exports = {
  createModerationRequest,
  getMyRequests,
  formatModerationRequest,
  formatModerationRequestListItem,
  SUPPORTED_CONTENT_TYPES,
};
