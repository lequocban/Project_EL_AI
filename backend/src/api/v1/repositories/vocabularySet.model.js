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

module.exports = { create, update, softDelete };
