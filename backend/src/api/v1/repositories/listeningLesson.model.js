const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Tạo mới một listening lesson.
 * @param {Object} data
 * @param {string} data.title
 * @param {string|null} data.audio_url
 * @param {string|null} data.transcript
 * @param {string|null} data.vi_translation
 * @param {string} data.status - 'private' | 'req_public' | 'public'
 * @param {string} data.created_by
 * @returns {Promise<Object>}
 */
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

/**
 * Cập nhật listening lesson theo id (không cho phép cập nhật status).
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
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

/**
 * Xóa mềm listening lesson (cập nhật trường deleted = true).
 * @param {string} id
 * @returns {Promise<Object>}
 */
const softDelete = async (id) => {
  const { data, error } = await supabase
    .from("listening_lessons")
    .update({ deleted: true })
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

/**
 * Tìm listening lesson theo id (không bao gồm bản ghi đã xóa mềm).
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  const { data, error } = await supabase
    .from("listening_lessons")
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
 * Lấy danh sách listening lessons public (phân trang, tìm kiếm).
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
    .from("listening_lessons")
    .select("id, title, audio_url, transcript, vi_translation, status, created_by, created_at", { count: "exact" })
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
 * Lấy danh sách listening lessons của một user (phân trang, tìm kiếm).
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
    .from("listening_lessons")
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
 * Lấy danh sách listening lessons đang chờ duyệt public (status = 'req_public').
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

/**
 * Cập nhật trạng thái listening lesson.
 * @param {string} id
 * @param {string} status
 * @returns {Promise<Object>}
 */
const updateStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("listening_lessons")
    .update({ status })
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
