const moderationRepository = require("../repositories/moderation.repository");
const vocabularySetRepository = require("../repositories/vocabularySet.repository");
const { AppError } = require("../../../utils/appError");

let readingLessonRepository = null;
let listeningLessonRepository = null;

try {
  readingLessonRepository = require("../repositories/readingLesson.repository");
} catch {
  // readingLesson.repository chưa tồn tại
}

try {
  listeningLessonRepository = require("../repositories/listeningLesson.repository");
} catch {
  // listeningLesson.repository chưa tồn tại
}

const SUPPORTED_CONTENT_TYPES = ["vocabulary_set", "reading_lesson", "listening_lesson"];

/**
 * Định dạng yêu cầu kiểm duyệt từ DB row.
 */
const formatModerationRequest = (request, contentInfo = null, reviewerInfo = null) => ({
  id: request.id,
  contentType: request.content_type,
  contentId: request.content_id,
  contentTitle: contentInfo?.title || null,
  status: request.status,
  requestedBy: request.requested_by,
  reviewedBy: request.reviewed_by || null,
  reviewedByName: reviewerInfo?.user_name || reviewerInfo?.name || null,
  reviewedAt: request.reviewed_at || null,
  reason: request.reason || null,
  notes: request.notes || null,
  createdAt: request.created_at,
});

/**
 * Tạo yêu cầu kiểm duyệt nội dung.
 */
const createModerationRequest = async (accessToken, userId, { contentType, contentId }) => {
  if (!contentType || !contentId) {
    throw new AppError("contentType và contentId là bắt buộc", 400);
  }

  if (!SUPPORTED_CONTENT_TYPES.includes(contentType)) {
    throw new AppError(
      `Loại nội dung '${contentType}' chưa được hỗ trợ kiểm duyệt. Các loại được hỗ trợ: ${SUPPORTED_CONTENT_TYPES.join(", ")}`,
      400
    );
  }

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

  const existingRequest = await moderationRepository.existsPendingRequest(
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

  const request = await moderationRepository.createModerationRequest(accessToken, {
    contentType,
    contentId,
    requestedBy: userId,
  });

  return formatModerationRequest(request, contentOwnership.content, null);
};

/**
 * Lấy danh sách yêu cầu kiểm duyệt của user (có sắp xếp).
 */
const getMyRequests = async (accessToken, userId, { keyword, status, page, limit, sortField, sortOrder }) => {
  const { data, total } = await moderationRepository.getRequestsByUser(accessToken, userId, {
    keyword,
    status,
    page,
    limit,
    sortField,
    sortOrder,
  });

  const enrichedData = await Promise.all(
    (data || []).map(async (req) => {
      const contentInfo = await getContentInfo(req.content_type, req.content_id);
      let reviewerInfo = null;
      if (req.reviewed_by) {
        reviewerInfo = await moderationRepository.getUserProfileById(req.reviewed_by);
      }
      return formatModerationRequest(req, contentInfo, reviewerInfo);
    })
  );

  const currentPage = page || 1;
  const currentLimit = limit || 15;
  const totalPages = Math.ceil((total || 0) / currentLimit);

  return {
    items: enrichedData,
    total: total || 0,
    page: currentPage,
    limit: currentLimit,
    totalPages,
  };
};

/**
 * Kiểm tra quyền sở hữu content theo từng loại.
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
  const set = await vocabularySetRepository.vocabularySetFindById(setId);
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
  if (!readingLessonRepository) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  const lesson = await readingLessonRepository.readingLessonFindById(lessonId);
  if (!lesson) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  return {
    exists: true,
    isOwner: lesson.created_by === userId,
    isPrivate: lesson.status === "private",
    currentStatus: lesson.status,
    content: { id: lesson.id, title: lesson.title },
  };
};

const verifyListeningLessonOwnership = async (lessonId, userId) => {
  if (!listeningLessonRepository) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  const lesson = await listeningLessonRepository.listeningLessonFindById(lessonId);
  if (!lesson) {
    return { exists: false, isOwner: false, isPrivate: false, currentStatus: null, content: null };
  }
  return {
    exists: true,
    isOwner: lesson.created_by === userId,
    isPrivate: lesson.status === "private",
    currentStatus: lesson.status,
    content: { id: lesson.id, title: lesson.title },
  };
};

/**
 * Lấy thông tin content theo type.
 */
const getContentInfo = async (contentType, contentId) => {
  switch (contentType) {
    case "vocabulary_set": {
      const set = await vocabularySetRepository.getVocabularySetById(contentId);
      if (!set) return null;
      return { id: set.id, title: set.title, description: set.description };
    }
    case "reading_lesson": {
      if (!readingLessonRepository) return null;
      const lesson = await readingLessonRepository.readingLessonFindById(contentId);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title };
    }
    case "listening_lesson": {
      if (!listeningLessonRepository) return null;
      const lesson = await listeningLessonRepository.listeningLessonFindById(contentId);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title };
    }
    default:
      return null;
  }
};

module.exports = {
  createModerationRequest,
  getMyRequests,
  formatModerationRequest,
  SUPPORTED_CONTENT_TYPES,
};
