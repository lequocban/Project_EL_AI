const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Lưu kết quả luyện tập từ vựng vào bảng vocabulary_practice.
 * @param {Object} data
 * @param {string} data.userId - ID người dùng
 * @param {string} data.vocabularyId - ID bộ từ vựng
 * @param {string} data.type - Loại bài luyện tập (quiz, flashcards, listening_quiz, word_matching)
 * @param {number} data.score - Điểm số (0-100)
 * @param {number} data.timeSpent - Thời gian hoàn thành (giây)
 * @param {Array} data.wrongWords - Danh sách từ sai
 * @returns {Promise<Object>}
 */
const createPracticeResult = async ({ userId, vocabularyId, type, score, timeSpent, wrongWords }) => {
  const { data, error } = await supabase
    .from("vocabulary_practice")
    .insert({
      user_id: userId,
      vocabulary_id: vocabularyId,
      type,
      score,
      time_spent: timeSpent,
      wrong_words: wrongWords,
      complete_at: new Date().toISOString(),
    })
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không thể lưu kết quả luyện tập", 500);
  }

  return data;
};

/**
 * Lấy danh sách kết quả luyện tập của một user.
 * @param {string} userId
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{data: Array, total: number}>}
 */
const getUserPracticeHistory = async (userId, { page = 1, limit = 10 } = {}) => {
  const safeLimit = Math.min(Math.max(1, limit), 20);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { data, error, count } = await supabase
    .from("vocabulary_practice")
    .select("id, score, type, time_spent, wrong_words, complete_at, vocabulary_id", { count: "exact" })
    .eq("user_id", userId)
    .order("complete_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

/**
 * Lấy điểm cao nhất của user cho một bộ từ vựng cụ thể.
 * @param {string} userId
 * @param {string} vocabularyId
 * @returns {Promise<number|null>}
 */
const getBestScore = async (userId, vocabularyId) => {
  const { data, error } = await supabase
    .from("vocabulary_practice")
    .select("score")
    .eq("user_id", userId)
    .eq("vocabulary_id", vocabularyId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data?.score ?? null;
};

module.exports = {
  createPracticeResult,
  getUserPracticeHistory,
  getBestScore,
};
