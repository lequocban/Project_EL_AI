const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Lấy thống kê học tập của user bằng Supabase query trực tiếp.
 * Mỗi phần chạy song song để giảm tổng thời gian phản hồi.
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const getLearningStats = async (userId) => {
  if (!userId) {
    throw new AppError("User ID không hợp lệ", 400);
  }

  // Chạy song song 3 query: vocabulary, reading, listening
  const [vocabResult, readingResult, listeningResult] = await Promise.all([
    getVocabStats(userId),
    getReadingStats(userId),
    getListeningStats(userId),
  ]);

  return {
    vocabulary: vocabResult,
    reading: readingResult,
    listening: listeningResult,
  };
};

/**
 * Thống kê từ vựng.
 * - ownedCount: số bộ từ vựng user sở hữu
 * - practicedCount: số bộ từ vựng đã từng luyện tập (distinct vocabulary_id)
 * - practiceCount: tổng số lần luyện tập
 * - avgScore: điểm trung bình
 */
const getVocabStats = async (userId) => {
  // Lấy số bộ từ vựng sở hữu
  const { count: ownedCount, error: ownedError } = await supabase
    .from("vocabulary_sets")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)
    .or("deleted.is.null,deleted.eq.false");

  if (ownedError) {
    throw new AppError("Không thể lấy thống kê từ vựng: " + ownedError.message, 500);
  }

  // Lấy số bộ đã luyện tập (distinct), tổng số lần, điểm trung bình
  const { data: practiceData, error: practiceError } = await supabase
    .from("vocabulary_practice")
    .select("vocabulary_id, score")
    .eq("user_id", userId);

  if (practiceError) {
    throw new AppError("Không thể lấy thống kê luyện tập từ vựng: " + practiceError.message, 500);
  }

  const practiceCount = practiceData?.length || 0;
  const practicedCount = new Set((practiceData || []).map((p) => p.vocabulary_id)).size;
  const scores = (practiceData || []).map((p) => p.score).filter((s) => s !== null && s !== undefined);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    ownedCount: ownedCount || 0,
    practicedCount,
    practiceCount,
    avgScore,
  };
};

/**
 * Thống kê luyện đọc.
 */
const getReadingStats = async (userId) => {
  // Lấy số bài luyện đọc sở hữu
  const { count: ownedCount, error: ownedError } = await supabase
    .from("reading_lessons")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)
    .or("deleted.is.null,deleted.eq.false");

  if (ownedError) {
    throw new AppError("Không thể lấy thống kê luyện đọc: " + ownedError.message, 500);
  }

  // Lấy danh sách bài luyện tập
  const { data: practiceData, error: practiceError } = await supabase
    .from("reading_practice")
    .select("lesson_id, score")
    .eq("user_id", userId);

  if (practiceError) {
    throw new AppError("Không thể lấy thống kê luyện đọc: " + practiceError.message, 500);
  }

  const practiceCount = practiceData?.length || 0;
  const practicedCount = new Set((practiceData || []).map((p) => p.lesson_id)).size;
  const scores = (practiceData || []).map((p) => p.score).filter((s) => s !== null && s !== undefined);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    ownedCount: ownedCount || 0,
    practicedCount,
    practiceCount,
    avgScore,
  };
};

/**
 * Thống kê luyện nghe.
 */
const getListeningStats = async (userId) => {
  // Lấy số bài luyện nghe sở hữu
  const { count: ownedCount, error: ownedError } = await supabase
    .from("listening_lessons")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)
    .or("deleted.is.null,deleted.eq.false");

  if (ownedError) {
    throw new AppError("Không thể lấy thống kê luyện nghe: " + ownedError.message, 500);
  }

  // Lấy danh sách bài luyện tập
  const { data: practiceData, error: practiceError } = await supabase
    .from("listening_practice")
    .select("lesson_id, score")
    .eq("user_id", userId);

  if (practiceError) {
    throw new AppError("Không thể lấy thống kê luyện nghe: " + practiceError.message, 500);
  }

  const practiceCount = practiceData?.length || 0;
  const practicedCount = new Set((practiceData || []).map((p) => p.lesson_id)).size;
  const scores = (practiceData || []).map((p) => p.score).filter((s) => s !== null && s !== undefined);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    ownedCount: ownedCount || 0,
    practicedCount,
    practiceCount,
    avgScore,
  };
};

module.exports = {
  getLearningStats,
};
