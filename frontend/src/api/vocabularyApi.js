import { fetchWithAuth } from "@/api/authApi";

// Các endpoint API cho vocabulary
const VOCABULARY_SET_URL = `/api/v1/vocabulary-sets`;
const VOCABULARY_URL = `/api/v1/vocabulary`;
const FAVORITE_URL = `/api/v1/favorites/vocabulary-sets`;
const VOCABULARY_PRACTICE_URL = `/api/v1/vocabulary-sets/practice`;

// Chuẩn hóa dữ liệu bộ từ vựng từ API
const normalizeSet = (set) => ({
  ...set,
  word_count: set.wordCount ?? set.word_count ?? set.words?.length ?? 0,
  status: set.status || "private",
  is_public: set.status === "public",
  is_pending: set.status === "req_public",
});

// Chuẩn hóa dữ liệu từ vựng từ API
const normalizeWord = (word) => ({
  ...word,
  pronunciation: word.pronunciation || word.phonetic || "",
  part_of_speech: word.part_of_speech || word.partOfSpeech || "",
});

export const vocabularyApi = {
  // Lấy danh sách bộ từ vựng của user hiện tại
  getMySets: async () => {
    const response = await fetchWithAuth(`${VOCABULARY_SET_URL}/my?limit=15`, {
      method: "GET",
    });
    return (response.data?.items || []).map(normalizeSet);
  },

  // Lấy danh sách bộ từ vựng công khai
  getPublicSets: async () => {
    const response = await fetchWithAuth(`${VOCABULARY_SET_URL}/public?limit=15`, {
      method: "GET",
    });
    return (response.data?.items || []).map(normalizeSet);
  },

  // Lấy chi tiết một bộ từ vựng, có hỗ trợ sắp xếp
  getSetById: async (id, sortField, sortOrder) => {
    let url = `${VOCABULARY_SET_URL}/${id}`;
    const params = new URLSearchParams();
    if (sortField) params.append("sortField", sortField);
    if (sortOrder) params.append("sortOrder", sortOrder);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetchWithAuth(url, {
      method: "GET",
    });
    return normalizeSet({
      ...response.data,
      words: (response.data?.words || []).map(normalizeWord),
    });
  },

  // Tạo mới một bộ từ vựng
  createSet: async ({ title, description }) => {
    const response = await fetchWithAuth(VOCABULARY_SET_URL, {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
    return normalizeSet(response.data);
  },

  // Xóa một bộ từ vựng theo ID
  deleteSet: async (id) => {
    return fetchWithAuth(`${VOCABULARY_SET_URL}/${id}`, {
      method: "DELETE",
    });
  },

  // Thêm danh sách từ vựng vào bộ từ
  addWordsToSet: async (id, words) => {
    return fetchWithAuth(`${VOCABULARY_SET_URL}/${id}/words`, {
      method: "POST",
      body: JSON.stringify({ words }),
    });
  },

  // Xóa nhiều từ vựng khỏi bộ từ
  deleteWordsFromSet: async (id, wordIds) => {
    return fetchWithAuth(`${VOCABULARY_SET_URL}/${id}/words/remove`, {
      method: "DELETE",
      body: JSON.stringify({ wordIds }),
    });
  },

  // Tra cứu thông tin của một từ vựng
  lookupWord: async (word) => {
    const response = await fetchWithAuth(`${VOCABULARY_URL}/lookup`, {
      method: "POST",
      body: JSON.stringify({ word }),
    });
    return normalizeWord(response.data);
  },

  // Tạo bộ từ vựng tự động bằng AI
  generateWordsWithAI: async ({ title, description, topic, wordCount }) => {
    const response = await fetchWithAuth(`${VOCABULARY_SET_URL}/generate-words`, {
      method: "POST",
      body: JSON.stringify({ title, description, topic, wordCount }),
    });
    const { setId } = response.data;
    if (!setId) {
      throw new Error("Không nhận được ID bộ từ vựng từ server");
    }
    return vocabularyApi.getSetById(setId);
  },

  // Lấy danh sách bộ từ yêu thích của user
  getFavorites: async () => {
    const response = await fetchWithAuth(FAVORITE_URL, { method: "GET" });
    return (response.data?.items || []).map(normalizeSet);
  },

  // Thêm một bộ từ vựng vào danh sách yêu thích
  addFavorite: async (setId) => {
    return fetchWithAuth(`${FAVORITE_URL}/${setId}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  // Xóa một bộ từ vựng khỏi danh sách yêu thích
  removeFavorite: async (setId) => {
    return fetchWithAuth(`${FAVORITE_URL}/${setId}`, {
      method: "DELETE",
    });
  },

  // Lấy lịch sử luyện tập từ vựng (chỉ bài Kiểm tra), có thể lọc theo bộ từ cụ thể
  getPracticeHistory: async ({ page = 1, limit = 20, vocabularySetId } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (vocabularySetId) params.append("vocabularySetId", vocabularySetId);
    const response = await fetchWithAuth(`${VOCABULARY_PRACTICE_URL}/history?${params}`, {
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

  // Lấy chi tiết bài đã làm từ vựng
  getPracticeDetail: async (practiceId) => {
    const response = await fetchWithAuth(`${VOCABULARY_PRACTICE_URL}/${practiceId}`, {
      method: "GET",
    });
    return response.data || {};
  },

  // Nộp bài luyện tập từ vựng (gồm 4 loại: quiz, listening_quiz, translate_write, listen_write)
  // Khi nộp bài, backend sẽ lưu lịch sử vào database
  submitPractice: async ({ setId, type, answers, timeSpent }) => {
    const response = await fetchWithAuth(`${VOCABULARY_PRACTICE_URL}/submit`, {
      method: "POST",
      body: JSON.stringify({ setId, type, answers, timeSpent }),
    });
    return response.data || {};
  },
};
