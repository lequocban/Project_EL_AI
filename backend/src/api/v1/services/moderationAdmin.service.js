const moderationRepository = require("../repositories/moderation.repository");
const vocabularySetRepository = require("../repositories/vocabularySet.repository");
const vocabularyService = require("./vocabulary.service");
const readingLessonRepository = require("../repositories/readingLesson.repository");
const readingQuestionRepository = require("../repositories/readingQuestion.repository");
const listeningLessonRepository = require("../repositories/listeningLesson.repository");
const listeningQuestionRepository = require("../repositories/listeningQuestion.repository");
const { AppError } = require("../../../utils/appError");
const { parsePagination } = require("../../../utils/pagination");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");
const { parseSortParams } = require("../../../utils/sorting");

const VALID_CONTENT_TYPES = ["vocabulary_set", "reading_lesson", "listening_lesson"];

/**
 * Kiểm tra content có yêu cầu kiểm duyệt đang pending không.
 * Nếu không có pending request thì throw error.
 * @param {string} contentId
 * @param {string} contentType
 */
const requirePendingModeration = async (contentId, contentType) => {
  const pending = await moderationRepository.checkPendingModeration(contentId, contentType);
  if (!pending) {
    throw new AppError(
      "Không tìm thấy yêu cầu kiểm duyệt đang chờ cho nội dung này",
      404
    );
  }
  return pending;
};

/**
 * Lấy thông tin content theo type để enrich cho danh sách kiểm duyệt.
 */
const getContentBasicInfo = async (contentType, contentId) => {
  switch (contentType) {
    case "vocabulary_set": {
      const set = await vocabularySetRepository.getVocabularySetById(contentId);
      if (!set) return null;
      return { id: set.id, title: set.title };
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

/**
 * Lấy thông tin user từ profile.
 */
const getUserProfile = async (userId) => {
  try {
    const { createAdminClient } = require("../../../config/supabase");
    const client = createAdminClient();
    const { data, error } = await client
      .from("profiles")
      .select("id, user_name, email")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[getUserProfile] Supabase error:", error.message, "userId:", userId);
      return null;
    }
    if (!data) {
      console.warn("[getUserProfile] No profile found for userId:", userId);
      return null;
    }
    return { id: data.id, userName: data.user_name, email: data.email };
  } catch (err) {
    console.error("[getUserProfile] Unexpected error:", err.message, "userId:", userId);
    return null;
  }
};

/**
 * Lấy danh sách yêu cầu kiểm duyệt theo loại nội dung.
 * @param {string} accessToken - JWT của admin/content_manager
 * @param {string} contentType - 'vocabulary_set' | 'reading_lesson' | 'listening_lesson'
 * @param {Object} queryParams
 */
const getModerationRequestsByContentType = async (accessToken, contentType, queryParams) => {
  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    throw new AppError(
      `Loại nội dung không hợp lệ. Các loại được hỗ trợ: ${VALID_CONTENT_TYPES.join(", ")}`,
      400
    );
  }

  const { page, limit } = parsePagination(queryParams, {
    defaultLimit: 15,
    maxLimit: 15,
  });

  const { sortColumn, ascending } = parseSortParams({
    sortField: queryParams.sortField,
    sortOrder: queryParams.sortOrder,
    allowedFields: ["created_at"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  const status = queryParams.status || "";

  const { data, total } = await moderationRepository.getRequestsByContentType(
    accessToken,
    contentType,
    {
      status,
      page,
      limit,
      sortField: sortColumn,
      sortOrder: ascending ? "asc" : "desc",
    }
  );

  const enrichedData = await Promise.all(
    (data || []).map(async (request) => {
      const contentInfo = await getContentBasicInfo(request.content_type, request.content_id);
      const requesterProfile = await getUserProfile(request.requested_by);
      const reviewerProfile = request.reviewed_by
        ? await getUserProfile(request.reviewed_by)
        : null;

      return {
        id: request.id,
        contentType: request.content_type,
        contentId: request.content_id,
        status: request.status,
        requestedBy: request.requested_by,
        reviewedBy: request.reviewed_by || null,
        reviewedAt: request.reviewed_at || null,
        createdAt: request.created_at,
        content: contentInfo,
        requester: requesterProfile
          ? {
              id: requesterProfile.id,
              userName: requesterProfile.userName,
              email: requesterProfile.email,
            }
          : null,
        reviewer: reviewerProfile
          ? {
              id: reviewerProfile.id,
              userName: reviewerProfile.userName,
              email: reviewerProfile.email,
            }
          : null,
      };
    })
  );

  return buildPaginationResponse(enrichedData, { page, limit, total, maxLimit: 15 });
};

// ============================================================
// CHỈNH SỬA NỘI DUNG — ADMIN / CONTENT MANAGER
// Yêu cầu: content đó phải có yêu cầu kiểm duyệt đang "pending"
// ============================================================

/**
 * Chỉnh sửa bộ từ vựng (khi đang pending kiểm duyệt).
 */
const updateVocabularySet = async (accessToken, setId, updateData) => {
  await requirePendingModeration(setId, "vocabulary_set");

  const existing = await vocabularySetRepository.vocabularySetFindById(setId);
  if (!existing) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  const updated = await vocabularySetRepository.update(setId, {
    title: updateData.title,
    description: updateData.description,
  });

  return {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    status: updated.status,
    createdBy: updated.created_by,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
};

/**
 * Chỉnh sửa bài luyện đọc (khi đang pending kiểm duyệt).
 */
const updateReadingLesson = async (accessToken, lessonId, updateData) => {
  await requirePendingModeration(lessonId, "reading_lesson");

  const existing = await readingLessonRepository.readingLessonFindById(lessonId);
  if (!existing) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  const updated = await readingLessonRepository.update(lessonId, {
    title: updateData.title,
    content: updateData.content,
    vi_translation: updateData.vi_translation,
  });

  return {
    id: updated.id,
    title: updated.title,
    content: updated.content,
    vi_translation: updated.vi_translation,
    status: updated.status,
    createdBy: updated.created_by,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
};

/**
 * Chỉnh sửa câu hỏi đọc hiểu (khi bài luyện đọc đang pending kiểm duyệt).
 * Cần truyền lessonId để verify quyền và kiểm tra pending.
 */
const updateReadingQuestion = async (accessToken, questionId, lessonId, updateData) => {
  await requirePendingModeration(lessonId, "reading_lesson");

  const existing = await readingQuestionRepository.findById(questionId);
  if (!existing) {
    throw new AppError("Không tìm thấy câu hỏi", 404);
  }

  if (existing.lesson_id !== lessonId) {
    throw new AppError("Câu hỏi không thuộc bài luyện đọc này", 400);
  }

  if (updateData.correct_answer !== undefined) {
    const normalized = updateData.correct_answer.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(normalized)) {
      throw new AppError("Đáp án đúng phải là A, B, C hoặc D", 400);
    }
  }

  const updated = await readingQuestionRepository.update(questionId, {
    question: updateData.question,
    option_a: updateData.option_a,
    option_b: updateData.option_b,
    option_c: updateData.option_c,
    option_d: updateData.option_d,
    correct_answer: updateData.correct_answer
      ? updateData.correct_answer.trim().toUpperCase()
      : undefined,
    explain: updateData.explain,
  });

  return {
    id: updated.id,
    lessonId: updated.lesson_id,
    question: updated.question,
    optionA: updated.option_a,
    optionB: updated.option_b,
    optionC: updated.option_c,
    optionD: updated.option_d,
    correctAnswer: updated.correct_answer,
    explain: updated.explain,
    createdAt: updated.created_at,
  };
};

/**
 * Chỉnh sửa bài luyện nghe (khi đang pending kiểm duyệt).
 */
const updateListeningLesson = async (accessToken, lessonId, updateData) => {
  await requirePendingModeration(lessonId, "listening_lesson");

  const existing = await listeningLessonRepository.listeningLessonFindById(lessonId);
  if (!existing) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  const updated = await listeningLessonRepository.update(lessonId, {
    title: updateData.title,
    audio_url: updateData.audio_url,
    transcript: updateData.transcript,
    vi_translation: updateData.vi_translation,
  });

  return {
    id: updated.id,
    title: updated.title,
    audio_url: updated.audio_url,
    transcript: updated.transcript,
    vi_translation: updated.vi_translation,
    status: updated.status,
    createdBy: updated.created_by,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
};

/**
 * Chỉnh sửa câu hỏi nghe hiểu (khi bài luyện nghe đang pending kiểm duyệt).
 */
const updateListeningQuestion = async (accessToken, questionId, lessonId, updateData) => {
  await requirePendingModeration(lessonId, "listening_lesson");

  const existing = await listeningQuestionRepository.findById(questionId);
  if (!existing) {
    throw new AppError("Không tìm thấy câu hỏi", 404);
  }

  if (existing.lesson_id !== lessonId) {
    throw new AppError("Câu hỏi không thuộc bài luyện nghe này", 400);
  }

  if (updateData.correct_answer !== undefined) {
    const normalized = updateData.correct_answer.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(normalized)) {
      throw new AppError("Đáp án đúng phải là A, B, C hoặc D", 400);
    }
  }

  const updated = await listeningQuestionRepository.update(questionId, {
    question: updateData.question,
    option_a: updateData.option_a,
    option_b: updateData.option_b,
    option_c: updateData.option_c,
    option_d: updateData.option_d,
    correct_answer: updateData.correct_answer
      ? updateData.correct_answer.trim().toUpperCase()
      : undefined,
    explain: updateData.explain,
  });

  return {
    id: updated.id,
    lessonId: updated.lesson_id,
    question: updated.question,
    optionA: updated.option_a,
    optionB: updated.option_b,
    optionC: updated.option_c,
    optionD: updated.option_d,
    correctAnswer: updated.correct_answer,
    explain: updated.explain,
    createdAt: updated.created_at,
  };
};

// ============================================================
// LẤY CHI TIẾT YÊU CẦU KIỂM DUYỆT — ADMIN / CONTENT MANAGER
// ============================================================

/**
 * Lấy chi tiết một yêu cầu kiểm duyệt (kèm nội dung đầy đủ).
 * - vocabulary_set: trả về thông tin bộ từ vựng + danh sách từ vựng
 * - reading_lesson: trả về thông tin bài luyện đọc + danh sách câu hỏi
 * - listening_lesson: trả về thông tin bài luyện nghe + danh sách câu hỏi
 * @param {string} requestId - ID của yêu cầu kiểm duyệt
 */
const getModerationRequestDetail = async (requestId) => {
  const { createAdminClient } = require("../../../config/supabase");
  const client = createAdminClient();

  const { data: request, error } = await client
    .from("moderation_requests")
    .select("id, content_type, content_id, status, requested_by, reviewed_by, reviewed_at, reason, notes, created_at")
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!request) {
    throw new AppError("Không tìm thấy yêu cầu kiểm duyệt", 404);
  }

  const requesterProfile = await getUserProfile(request.requested_by);
  const reviewerProfile = request.reviewed_by
    ? await getUserProfile(request.reviewed_by)
    : null;

  let contentDetail = null;

  switch (request.content_type) {
    case "vocabulary_set": {
      const set = await vocabularySetRepository.vocabularySetFindById(request.content_id);
      if (!set) {
        throw new AppError("Không tìm thấy bộ từ vựng", 404);
      }
      const words = await vocabularySetRepository.getWordsInSet(request.content_id, {});
      contentDetail = {
        id: set.id,
        title: set.title,
        description: set.description,
        status: set.status,
        createdBy: set.created_by,
        createdAt: set.created_at,
        updatedAt: set.updated_at,
        wordCount: words.length,
        words: words,
      };
      break;
    }
    case "reading_lesson": {
      const lesson = await readingLessonRepository.readingLessonFindById(request.content_id);
      if (!lesson) {
        throw new AppError("Không tìm thấy bài luyện đọc", 404);
      }
      const questions = await readingQuestionRepository.findByLessonId(request.content_id);
      contentDetail = {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        viTranslation: lesson.vi_translation,
        status: lesson.status,
        createdBy: lesson.created_by,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
        questionCount: questions.length,
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
      };
      break;
    }
    case "listening_lesson": {
      const lesson = await listeningLessonRepository.listeningLessonFindById(request.content_id);
      if (!lesson) {
        throw new AppError("Không tìm thấy bài luyện nghe", 404);
      }
      const questions = await listeningQuestionRepository.findByLessonId(request.content_id);
      contentDetail = {
        id: lesson.id,
        title: lesson.title,
        audioUrl: lesson.audio_url,
        transcript: lesson.transcript,
        viTranslation: lesson.vi_translation,
        status: lesson.status,
        createdBy: lesson.created_by,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
        questionCount: questions.length,
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
      };
      break;
    }
    default:
      contentDetail = null;
  }

  return {
    id: request.id,
    contentType: request.content_type,
    contentId: request.content_id,
    status: request.status,
    requestedBy: request.requested_by,
    reviewedBy: request.reviewed_by || null,
    reviewedAt: request.reviewed_at || null,
    reason: request.reason || null,
    notes: request.notes || null,
    createdAt: request.created_at,
    requester: requesterProfile
      ? { id: requesterProfile.id, userName: requesterProfile.userName, email: requesterProfile.email }
      : null,
    reviewer: reviewerProfile
      ? { id: reviewerProfile.id, userName: reviewerProfile.userName, email: reviewerProfile.email }
      : null,
    content: contentDetail,
  };
};

// ============================================================
// QUẢN LÝ TỪ VỰNG TRONG BỘ TỪ VỰNG — ADMIN / CONTENT MANAGER
// Yêu cầu: bộ từ vựng đó phải có yêu cầu kiểm duyệt đang "pending"
// ============================================================

/**
 * Thêm từ vựng vào bộ từ vựng (khi đang pending kiểm duyệt).
 * Body: { words: ["word1", "word2"] }
 * Tự động gọi Dictionary API + Translate API để lấy phonetic, audioUrl, meaning.
 */
const addWordsToVocabularySet = async (accessToken, setId, words) => {
  await requirePendingModeration(setId, "vocabulary_set");

  const existing = await vocabularySetRepository.vocabularySetFindById(setId);
  if (!existing) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (!words || words.length === 0) {
    throw new AppError("Vui lòng gửi danh sách từ vựng", 400);
  }

  const uniqueWords = [...new Set(words.map((w) => w.toLowerCase().trim()).filter(Boolean))];

  if (uniqueWords.length === 0) {
    throw new AppError("Danh sách từ vựng không hợp lệ", 400);
  }

  if (uniqueWords.length > 100) {
    throw new AppError("Số từ vựng không được vượt quá 100 từ mỗi lần thêm", 400);
  }

  const addedWords = [];

  for (const wordText of uniqueWords) {
    let wordRecord = await vocabularySetRepository.findWordByText(wordText);

    if (!wordRecord) {
      try {
        const [dictionaryData, meaning] = await Promise.all([
          vocabularyService.fetchDictionaryData(wordText),
          vocabularyService.fetchMeaning(wordText),
        ]);

        wordRecord = await vocabularySetRepository.createWord({
          word: wordText,
          phonetic: dictionaryData.phonetic,
          audioUrl: dictionaryData.audioUrl,
          meaning,
        });
      } catch (err) {
        wordRecord = await vocabularySetRepository.createWord({
          word: wordText,
          phonetic: null,
          audioUrl: null,
          meaning: null,
        });
      }
    }

    if (wordRecord) {
      await vocabularySetRepository.addWordsToSet(setId, [wordRecord.id]);
      addedWords.push({
        id: wordRecord.id,
        word: wordRecord.word,
        phonetic: wordRecord.phonetic,
        audioUrl: wordRecord.audio_url,
        meaning: wordRecord.meaning,
      });
    }
  }

  return {
    setId,
    addedCount: addedWords.length,
    words: addedWords,
  };
};

/**
 * Xóa từ vựng khỏi bộ từ vựng (khi đang pending kiểm duyệt).
 * Body: { wordIds: ["uuid1", "uuid2", ...] }
 */
const removeWordsFromVocabularySet = async (accessToken, setId, wordIds) => {
  await requirePendingModeration(setId, "vocabulary_set");

  const existing = await vocabularySetRepository.vocabularySetFindById(setId);
  if (!existing) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
    throw new AppError("Danh sách wordIds không hợp lệ hoặc trống", 400);
  }

  await vocabularySetRepository.removeWordsFromSet(setId, wordIds);

  return {
    setId,
    removedCount: wordIds.length,
    removedWordIds: wordIds,
  };
};

// ============================================================
// PHÊ DUYỆT / TỪ CHỐI YÊU CẦU KIỂM DUYỆT — ADMIN / CONTENT MANAGER
// ============================================================

const VALID_STATUS_TRANSITIONS = {
  approved: "approved",
  rejected: "rejected",
};

/**
 * Xác nhận (approve) hoặc từ chối (reject) yêu cầu kiểm duyệt.
 * Chỉ cập nhật bảng moderation_requests: status, reviewed_by, reviewed_at, reason, notes.
 * @param {string} reviewerId - ID của người duyệt
 * @param {string} requestId - ID của yêu cầu kiểm duyệt
 * @param {Object} data
 * @param {string} data.action - 'approve' hoặc 'reject'
 * @param {string} data.reason - Lý do duyệt/từ chối
 * @param {string} data.notes - Ghi chú thêm
 */
const reviewModerationRequest = async (reviewerId, requestId, { action, reason, notes }) => {
  if (!action || !["approve", "reject"].includes(action)) {
    throw new AppError("Action phải là 'approve' hoặc 'reject'", 400);
  }

  const targetStatus = action === "approve" ? "approved" : "rejected";

  const updated = await moderationRepository.updateModerationRequest(requestId, reviewerId, {
    status: targetStatus,
    reason: reason || null,
    notes: notes || null,
  });

  return {
    id: updated.id,
    contentType: updated.content_type,
    contentId: updated.content_id,
    status: updated.status,
    reviewedBy: updated.reviewed_by,
    reviewedAt: updated.reviewed_at,
    reason: updated.reason || null,
    notes: updated.notes || null,
    createdAt: updated.created_at,
  };
};

module.exports = {
  getModerationRequestsByContentType,
  VALID_CONTENT_TYPES,
  requirePendingModeration,
  updateVocabularySet,
  updateReadingLesson,
  updateReadingQuestion,
  updateListeningLesson,
  updateListeningQuestion,
  addWordsToVocabularySet,
  removeWordsFromVocabularySet,
  reviewModerationRequest,
  getModerationRequestDetail,
};
