const { createAuthedClient, createAdminClient, supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");
const { buildPaginationRange } = require("../../../utils/pagination");

// Lấy thông tin user profile từ Supabase (dùng admin client để không bị RLS giới hạn)
const getUserProfileById = async (userId) => {
  const client = createAdminClient();

  const { data, error } = await client
    .from("profiles")
    .select("id, user_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

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

const getRequestsByUser = async (accessToken, userId, { keyword, status, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const client = createAuthedClient(accessToken);
  const { from, to } = buildPaginationRange(page, limit, 15);

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

const findById = async (requestId) => {
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

const getRequestsByContentType = async (
  accessToken,
  contentType,
  { status, page = 1, limit = 15, sortField, sortOrder } = {}
) => {
  const client = createAdminClient();
  const { from, to } = buildPaginationRange(page, limit, 15);

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

const checkPendingModeration = async (contentId, contentType) => {
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

const updateModerationRequest = async (requestId, reviewerId, { status, reason, notes }) => {
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
  getUserProfileById,
};
