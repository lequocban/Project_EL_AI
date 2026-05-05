const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Tạo mới một vocabulary set.
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} data.status
 * @param {string} data.created_by
 * @returns {Promise<Object>}
 */
const create = async ({ title, description, status, created_by }) => {
  const { data, error } = await supabase
    .from("vocabulary_sets")
    .insert({
      title,
      description: description || null,
      status: status || "private",
      created_by,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không thể tạo bộ từ vựng", 500);
  }

  return data;
};

/**
 * Cập nhật vocabulary set theo id.
 * @param {string} id
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} data.status
 * @returns {Promise<Object>}
 */
const update = async (id, { title, description, status }) => {
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabase
    .from("vocabulary_sets")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  return data;
};

/**
 * Xóa mềm vocabulary set (cập nhật trường deleted = true).
 * @param {string} id
 * @returns {Promise<Object>}
 */
const softDelete = async (id) => {
  const { data, error } = await supabase
    .from("vocabulary_sets")
    .update({ deleted: true })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  return data;
};

/**
 * Lấy danh sách bộ từ vựng của một user (đã xóa mềm thì không lấy).
 * @param {string} userId
 * @param {Object} options
 * @param {string} options.keyword - Từ khóa tìm kiếm theo title
 * @param {number} options.page - Trang (bắt đầu từ 1)
 * @param {number} options.limit - Số item mỗi trang (max 15)
 * @returns {Promise<{data: Array, total: number}>}
 */
const getMySets = async (userId, { keyword, page = 1, limit = 15 }) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("vocabulary_sets")
    .select("id, title, description", { count: "exact" })
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
 * Lấy danh sách bộ từ vựng public (đã xóa mềm thì không lấy).
 * @param {Object} options
 * @param {string} options.keyword - Từ khóa tìm kiếm theo title
 * @param {number} options.page - Trang (bắt đầu từ 1)
 * @param {number} options.limit - Số item mỗi trang (max 15)
 * @returns {Promise<{data: Array, total: number}>}
 */
const getPublicSets = async ({ keyword, page = 1, limit = 15 }) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("vocabulary_sets")
    .select("id, title, description", { count: "exact" })
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
 * Đếm số từ trong một bộ từ vựng.
 * @param {string} setId
 * @returns {Promise<number>}
 */
const countWordsInSet = async (setId) => {
  const { count, error } = await supabase
    .from("vocabulary_set_words")
    .select("*", { count: "exact", head: true })
    .eq("vocabulary_id", setId);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return count || 0;
};

module.exports = { create, update, softDelete, getMySets, getPublicSets, countWordsInSet };
