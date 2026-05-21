const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { buildPaginationRange } = require("../../../utils/pagination");

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

const getUserPracticeHistory = async (userId, { page = 1, limit = 10 } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 20);

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
