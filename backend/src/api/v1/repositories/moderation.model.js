const { createAuthedClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

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
 * @returns {Promise<{data: Array, total: number}>}
 */
const getRequestsByUser = async (accessToken, userId, { keyword, status, page = 1, limit = 15 }) => {
  const client = createAuthedClient(accessToken);
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = client
    .from("moderation_requests")
    .select(
      "id, content_type, content_id, status, requested_by, reviewed_by, reviewed_at, created_at",
      { count: "exact" }
    )
    .eq("requested_by", userId)
    .order("created_at", { ascending: false })
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
  const { supabase } = require("../../../config/supabase");

  const { data, error } = await supabase
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

module.exports = {
  createModerationRequest,
  getRequestsByUser,
  findById,
  existsPendingRequest,
};
