const { supabase, createAuthedClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");

/**
 * Thêm một bộ từ vựng vào danh sách yêu thích.
 * @param {string} accessToken
 * @param {string} userId
 * @param {string} setId - vocabulary_sets.id
 * @returns {Promise<void>}
 */
const addFavorite = async (accessToken, userId, setId) => {
  const client = createAuthedClient(accessToken);

  const { error } = await client
    .from("favorite_vocabularies")
    .insert({ user_id: userId, vocabulary_id: setId });

  if (error) {
    if (error.code === "23505") {
      throw new AppError("Bộ từ vựng này đã có trong danh sách yêu thích", 409);
    }
    throw new AppError(error.message, 500);
  }
};

/**
 * Xóa một bộ từ vựng khỏi danh sách yêu thích.
 * @param {string} accessToken
 * @param {string} userId
 * @param {string} setId
 * @returns {Promise<void>}
 */
const removeFavorite = async (accessToken, userId, setId) => {
  const client = createAuthedClient(accessToken);

  const { error } = await client
    .from("favorite_vocabularies")
    .delete()
    .eq("user_id", userId)
    .eq("vocabulary_id", setId);

  if (error) {
    throw new AppError(error.message, 500);
  }
};

/**
 * Lấy danh sách bộ từ vựng yêu thích của user (phân trang).
 * Tách 2 query: favorite_vocabularies (authed) + vocabulary_sets (admin)
 * để tránh RLS join lọc sai kết quả.
 * @param {string} accessToken
 * @param {string} userId
 * @param {Object} options
 * @param {string} options.keyword
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string} options.sortField - Trường sắp xếp: "created_at" | "title"
 * @param {string} options.sortOrder - Thứ tự sắp xếp: "asc" | "desc"
 * @returns {Promise<{data: Array, total: number}>}
 */
const getFavorites = async (accessToken, userId, { keyword, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  // Bước 1: Lấy danh sách favorite của user (dùng authed client để pass RLS)
  const client = createAuthedClient(accessToken);
  const { data: favData, error: favError, count } = await client
    .from("favorite_vocabularies")
    .select("vocabulary_id", { count: "exact" })
    .eq("user_id", userId)
    .order("vocabulary_id", { ascending: false })
    .range(from, to);

  if (favError) {
    throw new AppError(favError.message, 500);
  }

  if (!favData || favData.length === 0) {
    return { data: [], total: count || 0 };
  }

  const vocabularyIds = favData.map((f) => f.vocabulary_id);

  // Bước 2: Lấy chi tiết vocabulary_sets theo IDs (dùng admin client)
  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at", "title"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  let setsQuery = supabase
    .from("vocabulary_sets")
    .select("id, title, description, created_at, deleted")
    .in("id", vocabularyIds)
    .order(sortColumn, buildSupabaseOrder(sortColumn, ascending));

  if (keyword && keyword.trim()) {
    setsQuery = setsQuery.ilike("title", `%${keyword.trim()}%`);
  }

  const { data: setsData, error: setsError } = await setsQuery;

  if (setsError) {
    throw new AppError(setsError.message, 500);
  }

  // Bước 3: Lọc bỏ các bộ đã xóa mềm và sắp xếp theo thứ tự favorite
  const activeSets = (setsData || []).reduce((acc, s) => {
    if (!s.deleted) {
      acc[s.id] = s;
    }
    return acc;
  }, {});

  const orderedSets = vocabularyIds
    .map((id) => activeSets[id])
    .filter(Boolean)
    .map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
    }));

  return { data: orderedSets, total: count || 0 };
};

module.exports = { addFavorite, removeFavorite, getFavorites };
