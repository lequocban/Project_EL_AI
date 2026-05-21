const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");
const { buildPaginationRange } = require("../../../utils/pagination");
const { softDeleteRecord, findByIdRecord, updateStatusRecord } = require("../../../utils/baseRepository");

const create = async ({ title, content, vi_translation, status, created_by }) => {
  const { data, error } = await supabase
    .from("reading_lessons")
    .insert({
      title: title?.trim() || null,
      content: content?.trim() || null,
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
    throw new AppError("Không thể tạo bài luyện đọc", 500);
  }

  return data;
};

const update = async (id, { title, content, vi_translation, status }) => {
  const updateData = {};

  if (title !== undefined) updateData.title = title?.trim() || null;
  if (content !== undefined) updateData.content = content?.trim() || null;
  if (vi_translation !== undefined) updateData.vi_translation = vi_translation?.trim() || null;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabase
    .from("reading_lessons")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  return data;
};

const readingLessonSoftDelete = async (id) => {
  return softDeleteRecord(supabase, "reading_lessons", id, "Không tìm thấy bài luyện đọc");
};

const readingLessonFindById = async (id) => {
  return findByIdRecord(supabase, "reading_lessons", id);
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
    .from("reading_lessons")
    .select("id, title, content, vi_translation, status, created_by, created_at", { count: "exact" })
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
    .from("reading_lessons")
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
    .from("reading_lessons")
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

const readingLessonUpdateStatus = async (id, status) => {
  return updateStatusRecord(supabase, "reading_lessons", id, status, "Không tìm thấy bài luyện đọc");
};

module.exports = {
  create,
  update,
  readingLessonSoftDelete,
  readingLessonFindById,
  getPublicLessons,
  getMyLessons,
  getPendingPublicLessons,
  readingLessonUpdateStatus,
};
