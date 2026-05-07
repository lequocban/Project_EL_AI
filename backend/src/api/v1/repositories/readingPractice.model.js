const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Lưu kết quả luyện đọc vào bảng reading_practice.
 * @param {Object} data
 * @param {string} data.userId - ID người dùng
 * @param {string} data.lessonId - ID bài luyện đọc
 * @param {string} data.userAnswer - JSON string chứa đáp án của user
 * @param {number} data.score - Điểm số (0-100)
 * @returns {Promise<Object>}
 */
const create = async ({ userId, lessonId, userAnswer, score }) => {
  const { data, error } = await supabase
    .from("reading_practice")
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      user_answer: userAnswer,
      score,
      complete_at: new Date().toISOString(),
    })
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không thể lưu kết quả luyện đọc", 500);
  }

  return data;
};

/**
 * Lấy lịch sử luyện đọc của user (phân trang).
 * @param {string} userId
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{data: Array, total: number}>}
 */
const getHistoryByUser = async (userId, { page = 1, limit = 10 } = {}) => {
  const safeLimit = Math.min(Math.max(1, limit), 20);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { data, error, count } = await supabase
    .from("reading_practice")
    .select("id, score, complete_at, lesson_id", { count: "exact" })
    .eq("user_id", userId)
    .order("complete_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

/**
 * Lấy điểm cao nhất của user cho một bài luyện đọc cụ thể.
 * @param {string} userId
 * @param {string} lessonId
 * @returns {Promise<number|null>}
 */
const getBestScore = async (userId, lessonId) => {
  const { data, error } = await supabase
    .from("reading_practice")
    .select("score")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data?.score ?? null;
};

/**
 * Tìm kết quả luyện đọc theo id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  const { data, error } = await supabase
    .from("reading_practice")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new AppError(error.message, 500);
  }

  return data;
};

module.exports = {
  create,
  getHistoryByUser,
  getBestScore,
  findById,
};
