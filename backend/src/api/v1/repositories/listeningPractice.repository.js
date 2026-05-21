const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");
const { buildPaginationRange } = require("../../../utils/pagination");
const { findByIdRaw } = require("../../../utils/baseRepository");

const create = async ({ userId, lessonId, userAnswer, score }) => {
  const { data, error } = await supabase
    .from("listening_practice")
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
    throw new AppError("Không thể lưu kết quả luyện nghe", 500);
  }

  return data;
};

const getHistoryByUser = async (userId, { page = 1, limit = 10, sortField, sortOrder } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 20);

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at", "complete_at"],
    defaultField: "complete_at",
    defaultOrder: "desc",
  });

  const { data, error, count } = await supabase
    .from("listening_practice")
    .select("id, score, complete_at, lesson_id", { count: "exact" })
    .eq("user_id", userId)
    .order(sortColumn, buildSupabaseOrder(sortColumn, ascending))
    .range(from, to);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

const getBestScore = async (userId, lessonId) => {
  const { data, error } = await supabase
    .from("listening_practice")
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

const listeningPracticeFindById = async (id) => {
  return findByIdRaw(supabase, "listening_practice", id);
};

module.exports = {
  create,
  getHistoryByUser,
  getBestScore,
  listeningPracticeFindById,
};
