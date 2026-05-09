import { fetchWithAuth } from "@/api/authApi";

const READING_LESSON_URL = `/api/v1/reading-lessons`;
const READING_PRACTICE_URL = `/api/v1/reading-lessons/practice`;

const normalizeLesson = (lesson) => ({
  ...lesson,
  level: lesson.level || "beginner",
  status: lesson.status || "private",
  is_public: lesson.status === "public",
  is_pending: lesson.status === "req_public",
});

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

export const readingApi = {
  // Lấy danh sách bài luyện đọc công khai
  getPublicLessons: async ({ page = 1, limit = 20, search = "" } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
    });
    const response = await fetchWithAuth(`${READING_LESSON_URL}/public?${params}`, {
      method: "GET",
    });
    const items = response.data?.items || [];
    return {
      items: items.map(normalizeLesson),
      total: response.data?.total ?? items.length,
      page: response.data?.page ?? page,
      totalPages: response.data?.totalPages ?? 1,
    };
  },

  // Lấy danh sách bài luyện đọc của tôi
  getMyLessons: async ({ page = 1, limit = 20, search = "" } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
    });
    const response = await fetchWithAuth(`${READING_LESSON_URL}/my?${params}`, {
      method: "GET",
    });
    const items = response.data?.items || [];
    return {
      items: items.map(normalizeLesson),
      total: response.data?.total ?? items.length,
      page: response.data?.page ?? page,
      totalPages: response.data?.totalPages ?? 1,
    };
  },

  // Lấy chi tiết một bài luyện đọc (kèm questions)
  getLessonById: async (id) => {
    const response = await fetchWithAuth(`${READING_LESSON_URL}/${id}`, {
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
    const response = await fetchWithAuth(`${READING_LESSON_URL}/${lessonId}/questions`, {
      method: "GET",
    });
    return (response.data || []).map(normalizeQuestion);
  },

  // Nộp bài luyện đọc
  submitReadingPractice: async (lessonId, answers) => {
    const body = { answers };
    if (lessonId) body.lessonId = lessonId;
    const response = await fetchWithAuth(
      `${READING_LESSON_URL}/${lessonId}/practice/submit`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    return response.data || {};
  },

  // Lấy lịch sử luyện đọc
  getPracticeHistory: async ({ page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetchWithAuth(`${READING_PRACTICE_URL}/history?${params}`, {
      method: "GET",
    });
    return {
      items: response.data?.items || [],
      total: response.data?.total ?? 0,
      page: response.data?.page ?? page,
      totalPages: response.data?.totalPages ?? 1,
    };
  },

  // Lấy chi tiết bài đã làm
  getPracticeDetail: async (practiceId) => {
    const response = await fetchWithAuth(`${READING_PRACTICE_URL}/${practiceId}`, {
      method: "GET",
    });
    return response.data || {};
  },
};
