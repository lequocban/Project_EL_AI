const { createAuthedClient, createAdminClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");

/**
 * Tạo yêu cầu kiểm duyệt mới.
 * Cần truyền accessToken để RLS nhận diện user.
 * @param {string} accessToken
 * @param {Object} data
 * @param {string} data.contentType - Loại nội dung (vd: 'vocabulary_set', 'reading_lesson', 'listening_lesson')
 * @param {string} data.contentId - ID của nội dung cần kiểm duyệt
 * @param {string} data.requestedBy - ID của user gửi yêu cầu
 * @returns {Promise<Object>}
 */
const createModerationRequest = async (accessToken, { contentType, contentId, requestedBy }) => {
  const client = createAuthedClient(accessToken);

  const { data, error } = await client
    .from("moderation_requests")
    .insert({
      content_type: contentType,
      content_id: contentId,
      requested_by: requestedBy,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select("id, content_type, content_id, status, created_at")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không thể tạo yêu cầu kiểm duyệt", 500);
  }

  return data;
};

/**
 * Lấy danh sách yêu cầu kiểm duyệt của một user.
 * Cần truyền accessToken để RLS nhận diện user.
 * @param {string} accessToken
 * @param {string} userId - ID của user
 * @param {Object} options
 * @param {string} options.keyword - Từ khóa tìm kiếm (tìm theo content_type)
 * @param {string} options.status - Lọc theo trạng thái
 * @param {number} options.page - Trang (bắt đầu từ 1)
 * @param {number} options.limit - Số item mỗi trang (max 15)
 * @param {string} options.sortField - Trường sắp xếp: "created_at"
 * @param {string} options.sortOrder - Thứ tự sắp xếp: "asc" | "desc"
 * @returns {Promise<{data: Array, total: number}>}
 */
const getRequestsByUser = async (accessToken, userId, { keyword, status, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const client = createAuthedClient(accessToken);
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  let query = client
    .from("moderation_requests")
    .select(
      "id, content_type, content_id, status, requested_by, reviewed_by, reviewed_at, reason, notes, created_at",
      { count: "exact" }
    )
    .eq("requested_by", userId)
    .order(sortColumn, buildSupabaseOrder(sortColumn, ascending))
    .range(from, to);

  if (status && status.trim()) {
    query = query.eq("status", status.trim());
  }

  if (keyword && keyword.trim()) {
    query = query.ilike("content_type", `%${keyword.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

/**
 * Tìm một yêu cầu kiểm duyệt theo ID (dùng service key, không cần token).
 * @param {string} requestId
 * @returns {Promise<Object|null>}
 */
const findById = async (requestId) => {
  const { createAdminClient } = require("../../../config/supabase");
  const client = createAdminClient();

  const { data, error } = await client
    .from("moderation_requests")
    .select("id, content_type, content_id, status, requested_by")
    .eq("id", requestId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new AppError(error.message, 500);
  }

  return data;
};

/**
 * Kiểm tra yêu cầu kiểm duyệt đã tồn tại cho content_id và content_type
 * (cùng user, cùng content, chưa resolved).
 * @param {string} accessToken
 * @param {string} contentId
 * @param {string} contentType
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
const existsPendingRequest = async (accessToken, contentId, contentType, userId) => {
  const client = createAuthedClient(accessToken);

  const { data, error } = await client
    .from("moderation_requests")
    .select("id")
    .eq("content_id", contentId)
    .eq("content_type", contentType)
    .eq("requested_by", userId)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return !!data;
};

/**
 * Lấy danh sách yêu cầu kiểm duyệt theo loại nội dung.
 * Cần truyền accessToken để RLS nhận diện user (admin/content_manager).
 * @param {string} accessToken - JWT của admin/content_manager
 * @param {string} contentType - Loại nội dung: 'vocabulary_set' | 'reading_lesson' | 'listening_lesson'
 * @param {Object} options
 * @param {string} options.status - Lọc theo trạng thái
 * @param {string} options.keyword - Từ khóa tìm kiếm theo tiêu đề nội dung
 * @param {number} options.page - Trang (bắt đầu từ 1)
 * @param {number} options.limit - Số item mỗi trang (max 15)
 * @param {string} options.sortField - Trường sắp xếp: "created_at"
 * @param {string} options.sortOrder - Thứ tự sắp xếp: "asc" | "desc"
 * @returns {Promise<{data: Array, total: number}>}
 */
const getRequestsByContentType = async (
  accessToken,
  contentType,
  { status, page = 1, limit = 15, sortField, sortOrder } = {}
) => {
  const client = createAdminClient();
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  let query = client
    .from("moderation_requests")
    .select(
      "id, content_type, content_id, status, requested_by, reviewed_by, reviewed_at, created_at",
      { count: "exact" }
    )
    .eq("content_type", contentType)
    .order(sortColumn, buildSupabaseOrder(sortColumn, ascending))
    .range(from, to);

  if (status && status.trim()) {
    query = query.eq("status", status.trim());
  }

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { data: data || [], total: count || 0 };
};

/**
 * Kiểm tra content có yêu cầu kiểm duyệt đang pending không.
 * Dùng service role (không cần token).
 * @param {string} contentId
 * @param {string} contentType
 * @returns {Promise<Object|null>} - Trả về request pending hoặc null
 */
const checkPendingModeration = async (contentId, contentType) => {
  const { supabase } = require("../../../config/supabase");

  const { data, error } = await supabase
    .from("moderation_requests")
    .select("id, content_type, content_id, status")
    .eq("content_id", contentId)
    .eq("content_type", contentType)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

/**
 * Cập nhật yêu cầu kiểm duyệt (approve/reject).
 * Chỉ cập nhật bảng moderation_requests: status, reviewed_by, reviewed_at, reason, notes.
 * @param {string} requestId - ID của yêu cầu kiểm duyệt
 * @param {string} reviewerId - ID của người duyệt (admin/content_manager)
 * @param {Object} updateData
 * @param {string} updateData.status - 'approved' hoặc 'rejected'
 * @param {string} updateData.reason - Lý do duyệt/từ chối
 * @param {string} updateData.notes - Ghi chú thêm
 * @returns {Promise<Object>} - Trả về request đã cập nhật
 */
const updateModerationRequest = async (requestId, reviewerId, { status, reason, notes }) => {
  const { createAdminClient } = require("../../../config/supabase");
  const client = createAdminClient();

  const updatePayload = {
    status,
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
  };

  if (reason !== undefined) {
    updatePayload.reason = reason;
  }
  if (notes !== undefined) {
    updatePayload.notes = notes;
  }

  const { data, error } = await client
    .from("moderation_requests")
    .update(updatePayload)
    .eq("id", requestId)
    .select("id, content_type, content_id, status, reviewed_by, reviewed_at, reason, notes, created_at")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không tìm thấy yêu cầu kiểm duyệt", 404);
  }

  return data;
};

module.exports = {
  createModerationRequest,
  getRequestsByUser,
  getRequestsByContentType,
  findById,
  existsPendingRequest,
  checkPendingModeration,
  updateModerationRequest,
};
