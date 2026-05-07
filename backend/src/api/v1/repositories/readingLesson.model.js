const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Tạo mới một reading lesson.
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.content
 * @param {string|null} data.vi_translation
 * @param {string} data.status - 'private' | 'req_public' | 'public'
 * @param {string} data.created_by
 * @returns {Promise<Object>}
 */
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

/**
 * Cập nhật reading lesson theo id.
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
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

/**
 * Xóa mềm reading lesson (cập nhật trường deleted = true).
 * @param {string} id
 * @returns {Promise<Object>}
 */
const softDelete = async (id) => {
  const { data, error } = await supabase
    .from("reading_lessons")
    .update({ deleted: true })
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

/**
 * Tìm reading lesson theo id (không bao gồm bản ghi đã xóa mềm).
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  const { data, error } = await supabase
    .from("reading_lessons")
    .select("*")
    .eq("id", id)
    .eq("deleted", false)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new AppError(error.message, 500);
  }

  return data;
};

/**
 * Lấy danh sách reading lessons public (phân trang, tìm kiếm).
 * @param {Object} options
 * @param {string} options.keyword
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{data: Array, total: number}>}
 */
const getPublicLessons = async ({ keyword, page = 1, limit = 15 }) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("reading_lessons")
    .select("id, title, content, vi_translation, status, created_by, created_at", { count: "exact" })
    .eq("status", "public")
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

/**
 * Lấy danh sách reading lessons của một user (phân trang, tìm kiếm).
 * @param {string} userId
 * @param {Object} options
 * @param {string} options.keyword
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{data: Array, total: number}>}
 */
const getMyLessons = async (userId, { keyword, page = 1, limit = 15 }) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("reading_lessons")
    .select("id, title, status, created_at", { count: "exact" })
    .eq("created_by", userId)
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

/**
 * Lấy danh sách reading lessons đang chờ duyệt public (status = 'req_public').
 * @param {Object} options
 * @param {string} options.keyword
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{data: Array, total: number}>}
 */
const getPendingPublicLessons = async ({ keyword, page = 1, limit = 15 }) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

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

/**
 * Cập nhật trạng thái reading lesson.
 * @param {string} id
 * @param {string} status
 * @returns {Promise<Object>}
 */
const updateStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("reading_lessons")
    .update({ status })
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

module.exports = {
  create,
  update,
  softDelete,
  findById,
  getPublicLessons,
  getMyLessons,
  getPendingPublicLessons,
  updateStatus,
};
