const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");
const { buildPaginationRange } = require("../../../utils/pagination");
const { softDeleteRecord, findByIdRecord, updateStatusRecord } = require("../../../utils/baseRepository");

const create = async ({ title, audio_url, transcript, vi_translation, status, created_by }) => {
  const { data, error } = await supabase
    .from("listening_lessons")
    .insert({
      title: title?.trim() || null,
      audio_url: audio_url?.trim() || null,
      transcript: transcript?.trim() || null,
      vi_translation: vi_translation?.trim() || null,
      status: status || "private",
      deleted: false,
      created_by,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không thể tạo bài luyện nghe", 500);
  }

  return data;
};

const update = async (id, { title, audio_url, transcript, vi_translation }) => {
  const updateData = {};

  if (title !== undefined) updateData.title = title?.trim() || null;
  if (audio_url !== undefined) updateData.audio_url = audio_url?.trim() || null;
  if (transcript !== undefined) updateData.transcript = transcript?.trim() || null;
  if (vi_translation !== undefined) updateData.vi_translation = vi_translation?.trim() || null;

  const { data, error } = await supabase
    .from("listening_lessons")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không tìm thấy bài luyện nghe", 404);
  }

  return data;
};

const listeningLessonSoftDelete = async (id) => {
  return softDeleteRecord(supabase, "listening_lessons", id, "Không tìm thấy bài luyện nghe");
};

const listeningLessonFindById = async (id) => {
  return findByIdRecord(supabase, "listening_lessons", id);
};

const getPublicLessons = async ({ keyword, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 15);

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at", "title"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  let query = supabase
    .from("listening_lessons")
    .select("id, title, audio_url, transcript, vi_translation, status, created_by, created_at", { count: "exact" })
    .eq("status", "public")
    .eq("deleted", false)
    .order(sortColumn, buildSupabaseOrder(sortColumn, ascending))
    .range(from, to);

  if (keyword && keyword.trim()) {
    query = query.ilike("title", `%${keyword.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

const getMyLessons = async (userId, { keyword, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 15);

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at", "title"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  let query = supabase
    .from("listening_lessons")
    .select("id, title, status, created_at", { count: "exact" })
    .eq("created_by", userId)
    .eq("deleted", false)
    .order(sortColumn, buildSupabaseOrder(sortColumn, ascending))
    .range(from, to);

  if (keyword && keyword.trim()) {
    query = query.ilike("title", `%${keyword.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

const getPendingPublicLessons = async ({ keyword, page = 1, limit = 15 } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 15);

  let query = supabase
    .from("listening_lessons")
    .select("id, title, status, created_by, created_at", { count: "exact" })
    .eq("status", "req_public")
    .eq("deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (keyword && keyword.trim()) {
    query = query.ilike("title", `%${keyword.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

const listeningLessonUpdateStatus = async (id, status) => {
  return updateStatusRecord(supabase, "listening_lessons", id, status, "Không tìm thấy bài luyện nghe");
};

module.exports = {
  create,
  update,
  listeningLessonSoftDelete,
  listeningLessonFindById,
  getPublicLessons,
  getMyLessons,
  getPendingPublicLessons,
  listeningLessonUpdateStatus,
};
