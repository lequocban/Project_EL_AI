const moderationModel = require("../repositories/moderation.model");
const vocabularySetModel = require("../repositories/vocabularySet.model");
const vocabularyService = require("./vocabulary.service");
const readingLessonModel = require("../repositories/readingLesson.model");
const listeningLessonModel = require("../repositories/listeningLesson.model");
const readingQuestionModel = require("../repositories/readingQuestion.model");
const listeningQuestionModel = require("../repositories/listeningQuestion.model");
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
  const pending = await moderationModel.checkPendingModeration(contentId, contentType);
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
      const set = await vocabularySetModel.getVocabularySetById(contentId);
      if (!set) return null;
      return { id: set.id, title: set.title };
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

/**
 * Lấy thông tin user từ profile.
 */
const getUserProfile = async (userId) => {
  try {
    const { supabase } = require("../../../config/supabase");
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_name, email")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return { id: data.id, userName: data.user_name, email: data.email };
  } catch {
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

  const { data, total } = await moderationModel.getRequestsByContentType(
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

  const existing = await vocabularySetModel.findById(setId);
  if (!existing) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  const updated = await vocabularySetModel.update(setId, {
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

  const existing = await readingLessonModel.findById(lessonId);
  if (!existing) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  const updated = await readingLessonModel.update(lessonId, {
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

  const existing = await readingQuestionModel.findById(questionId);
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

  const updated = await readingQuestionModel.update(questionId, {
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

  const existing = await listeningLessonModel.findById(lessonId);
  if (!existing) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  const updated = await listeningLessonModel.update(lessonId, {
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

  const existing = await listeningQuestionModel.findById(questionId);
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

  const updated = await listeningQuestionModel.update(questionId, {
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

  const existing = await vocabularySetModel.findById(setId);
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
    let wordRecord = await vocabularySetModel.findWordByText(wordText);

    if (!wordRecord) {
      try {
        const [dictionaryData, meaning] = await Promise.all([
          vocabularyService.fetchDictionaryData(wordText),
          vocabularyService.fetchMeaning(wordText),
        ]);

        wordRecord = await vocabularySetModel.createWord({
          word: wordText,
          phonetic: dictionaryData.phonetic,
          audioUrl: dictionaryData.audioUrl,
          meaning,
        });
      } catch (err) {
        wordRecord = await vocabularySetModel.createWord({
          word: wordText,
          phonetic: null,
          audioUrl: null,
          meaning: null,
        });
      }
    }

    if (wordRecord) {
      await vocabularySetModel.addWordsToSet(setId, [wordRecord.id]);
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

  const existing = await vocabularySetModel.findById(setId);
  if (!existing) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
    throw new AppError("Danh sách wordIds không hợp lệ hoặc trống", 400);
  }

  await vocabularySetModel.removeWordsFromSet(setId, wordIds);

  return {
    setId,
    removedCount: wordIds.length,
    removedWordIds: wordIds,
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
};
