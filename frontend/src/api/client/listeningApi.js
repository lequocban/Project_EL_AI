import { fetchWithAuth } from "@/api/authApi";
import { uploadAudioToCloudinary } from "@/services/cloudinary";

// Các endpoint API cho listening (phía client người dùng)
const LISTENING_LESSON_URL = `/api/v1/listening-lessons`;
const LISTENING_PRACTICE_URL = `/api/v1/listening-lessons/practice`;

// Chuẩn hóa dữ liệu bài luyện nghe từ API
const normalizeLesson = (lesson) => ({
  ...lesson,
  level: lesson.level || "beginner",
  status: lesson.status || "private",
  is_public: lesson.status === "public",
  is_pending: lesson.status === "req_public",
  questionCount: lesson.question_count ?? lesson.questionCount ?? lesson.num_questions ?? 0,
  transcript: lesson.transcript || lesson.audio_script || "",
  vi_translation: lesson.viTranslation || lesson.vi_translation || "",
});

// Chuẩn hóa dữ liệu câu hỏi từ API
const normalizeQuestion = (q) => ({
  ...q,
  options: [
    q.optionA ?? q.option_a ?? "",
    q.optionB ?? q.option_b ?? "",
    q.optionC ?? q.option_c ?? "",
    q.optionD ?? q.option_d ?? "",
  ],
  correct_answer: q.correctAnswer ?? q.correct_answer ?? "A",
  explain: q.explanation ?? q.explain ?? "",
});

export const listeningApi = {
  // Lấy danh sách bài luyện nghe công khai (có phân trang)
  getPublicLessons: async ({ page = 1, limit = 20, search = "", sortField = "created_at", sortOrder = "desc" } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { keyword: search } : {}),
      ...(sortField ? { sortField } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    });
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}/public?${params}`, {
      method: "GET",
    });
    const items = response.data?.items || [];
    const pagination = response.data?.pagination || response.data || {};
    return {
      items: items.map(normalizeLesson),
      total: pagination.total ?? items.length,
      page: pagination.page ?? page,
      totalPages: pagination.totalPages ?? 1,
    };
  },

  // Lấy danh sách bài luyện nghe của tôi (có phân trang)
  getMyLessons: async ({ page = 1, limit = 20, search = "", sortField = "created_at", sortOrder = "desc" } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { keyword: search } : {}),
      ...(sortField ? { sortField } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    });
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}/my?${params}`, {
      method: "GET",
    });
    const items = response.data?.items || [];
    const pagination = response.data?.pagination || response.data || {};
    return {
      items: items.map(normalizeLesson),
      total: pagination.total ?? items.length,
      page: pagination.page ?? page,
      totalPages: pagination.totalPages ?? 1,
    };
  },

  // Lấy chi tiết một bài luyện nghe (kèm questions)
  getLessonById: async (id) => {
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}/${id}`, {
      method: "GET",
    });
    const lesson = normalizeLesson(response.data || {});
    if (lesson.questions) {
      lesson.questions = lesson.questions.map(normalizeQuestion);
    }
    return lesson;
  },

  // Lấy câu hỏi theo lesson
  getQuestionsByLesson: async (lessonId) => {
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}/${lessonId}/questions`, {
      method: "GET",
    });
    return (response.data || []).map(normalizeQuestion);
  },

  // Nộp bài luyện nghe
  submitListeningPractice: async (lessonId, answers) => {
    const body = { answers };
    if (lessonId) body.lessonId = lessonId;
    const response = await fetchWithAuth(
      `${LISTENING_LESSON_URL}/${lessonId}/practice/submit`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    return response.data || {};
  },

  // Lấy lịch sử luyện nghe (có phân trang)
  getPracticeHistory: async ({ page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetchWithAuth(`${LISTENING_PRACTICE_URL}/history?${params}`, {
      method: "GET",
    });
    const pagination = response.data?.pagination || {};
    return {
      items: response.data?.items || [],
      total: pagination.total ?? 0,
      page: pagination.page ?? page,
      totalPages: pagination.totalPages ?? 1,
    };
  },

  // Lấy chi tiết bài đã làm
  getPracticeDetail: async (practiceId) => {
    const response = await fetchWithAuth(`${LISTENING_PRACTICE_URL}/${practiceId}`, {
      method: "GET",
    });
    return response.data || {};
  },

  // Tạo bài luyện nghe (thủ công)
  createLesson: async ({ title, audioUrl, transcript, viTranslation }) => {
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}`, {
      method: "POST",
      body: JSON.stringify({
        title,
        ...(audioUrl ? { audioUrl } : {}),
        ...(transcript ? { transcript } : {}),
        ...(viTranslation ? { viTranslation } : {}),
      }),
    });
    return normalizeLesson(response.data || {});
  },

  // Tạo bài luyện nghe bằng AI
  generateWithAI: async ({ title, topic, level, questionCount }) => {
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}/generate-ai`, {
      method: "POST",
      body: JSON.stringify({ title, topic, level, questionCount }),
    });
    return normalizeLesson(response.data || {});
  },

  // Cập nhật bài luyện nghe
  updateLesson: async (id, data) => {
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data || {};
  },

  // Xóa bài luyện nghe
  deleteLesson: async (id) => {
    const response = await fetchWithAuth(`${LISTENING_LESSON_URL}/${id}`, {
      method: "DELETE",
    });
    return response.data || {};
  },

  // Tạo nhiều câu hỏi cùng lúc cho bài luyện nghe
  createBulkQuestions: async (lessonId, questions) => {
    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct_answer: q.correct_answer,
      explain: q.explain,
    }));
    const response = await fetchWithAuth(
      `${LISTENING_LESSON_URL}/${lessonId}/questions/bulk`,
      {
        method: "POST",
        body: JSON.stringify({ questions: formattedQuestions }),
      }
    );
    return (response.data || []).map(normalizeQuestion);
  },

  // Cập nhật một câu hỏi
  updateQuestion: async (questionId, data) => {
    const response = await fetchWithAuth(`/api/v1/listening-questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return normalizeQuestion(response.data || {});
  },

  // Xóa một câu hỏi
  deleteQuestion: async (questionId) => {
    const response = await fetchWithAuth(`/api/v1/listening-questions/${questionId}`, {
      method: "DELETE",
    });
    return response.data || {};
  },

  // Gọi AI giải thích chi tiết đáp án cho câu hỏi luyện nghe
  explainAnswer: async ({ content, viTranslation, question, allAnswers, userAnswer, correctAnswer }) => {
    // Chỉ truyền viTranslation khi có nội dung, tránh lỗi validation backend (.min(1))
    const body = {
      lessonType: "listening",
      content,
      question,
      allAnswers,
      userAnswer,
      correctAnswer,
    };
    if (viTranslation && viTranslation.trim()) {
      body.viTranslation = viTranslation;
    }
    const response = await fetchWithAuth(`/api/v1/explain-by-ai`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response.data?.explanation || "";
  },

  // Upload file audio lên Cloudinary và trả về URL công khai
  uploadAudio: async (file, title, onProgress) => {
    const url = await uploadAudioToCloudinary(file, title, onProgress);
    return url;
  },

  // Yêu cầu công khai bài luyện nghe (tạo yêu cầu kiểm duyệt)
  requestPublic: async (lessonId) => {
    return fetchWithAuth(`${LISTENING_LESSON_URL}/${lessonId}/request-public`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  // Gửi yêu cầu kiểm duyệt bài luyện nghe (dùng chung endpoint moderation-requests)
  requestModeration: async (lessonId) => {
    return fetchWithAuth("/api/v1/moderation-requests", {
      method: "POST",
      body: JSON.stringify({ contentType: "listening_lesson", contentId: lessonId }),
    });
  },

  // Lấy danh sách yêu cầu kiểm duyệt của user hiện tại
  getMyModerationRequests: async ({ page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetchWithAuth(`/api/v1/moderation-requests/my?${params}`, {
      method: "GET",
    });
    const data = response.data || {};
    return {
      items: data.data || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit,
    };
  },

  // Chuyển bài luyện nghe về chế độ riêng tư
  makePrivate: async (lessonId) => {
    return fetchWithAuth(`${LISTENING_LESSON_URL}/${lessonId}/make-private`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
};
