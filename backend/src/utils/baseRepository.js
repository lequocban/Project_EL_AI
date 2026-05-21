/**
 * Các helper CRUD dùng chung cho Supabase repositories.
 * Giúp giảm lặp code giữa các repository.
 */
const { AppError } = require("./appError");

/**
 * Tìm một bản ghi theo id, không bao gồm bản ghi đã xóa mềm.
 */
const findByIdRecord = async (client, table, id) => {
  const { data, error } = await client
    .from(table)
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
 * Tìm một bản ghi theo id (không lọc deleted, dùng cho bảng không có trường deleted).
 */
const findByIdRaw = async (client, table, id) => {
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new AppError(error.message, 500);
  }

  return data;
};

/**
 * Xóa mềm một bản ghi (cập nhật trường deleted = true).
 */
const softDeleteRecord = async (client, table, id, errorMsg = "Không tìm thấy bản ghi") => {
  const { data, error } = await client
    .from(table)
    .update({ deleted: true })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError(errorMsg, 404);
  }

  return data;
};

/**
 * Cập nhật trạng thái của một bản ghi.
 */
const updateStatusRecord = async (client, table, id, status, errorMsg = "Không tìm thấy bản ghi") => {
  const { data, error } = await client
    .from(table)
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError(errorMsg, 404);
  }

  return data;
};

module.exports = {
  findByIdRecord,
  findByIdRaw,
  softDeleteRecord,
  updateStatusRecord,
};
