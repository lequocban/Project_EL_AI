const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");

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
 * @param {string} options.sortField - Trường sắp xếp: "created_at" | "title"
 * @param {string} options.sortOrder - Thứ tự sắp xếp: "asc" | "desc"
 * @returns {Promise<{data: Array, total: number}>}
 */
const getMySets = async (userId, { keyword, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at", "title"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  let query = supabase
    .from("vocabulary_sets")
    .select("id, title, description", { count: "exact" })
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

/**
 * Lấy danh sách bộ từ vựng public (đã xóa mềm thì không lấy).
 * @param {Object} options
 * @param {string} options.keyword - Từ khóa tìm kiếm theo title
 * @param {number} options.page - Trang (bắt đầu từ 1)
 * @param {number} options.limit - Số item mỗi trang (max 15)
 * @param {string} options.sortField - Trường sắp xếp: "created_at" | "title"
 * @param {string} options.sortOrder - Thứ tự sắp xếp: "asc" | "desc"
 * @returns {Promise<{data: Array, total: number}>}
 */
const getPublicSets = async ({ keyword, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at", "title"],
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  let query = supabase
    .from("vocabulary_sets")
    .select("id, title, description", { count: "exact" })
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

/**
 * Đếm số từ trong một bộ từ vựng.
 * Dùng select thay head mode để đảm bảo count chính xác, không bị giới hạn bởi default RLS limit.
 * @param {string} setId
 * @returns {Promise<number>}
 */
const countWordsInSet = async (setId) => {
  const { count, error } = await supabase
    .from("vocabulary_set_words")
    .select("*", { count: "exact" })
    .eq("vocabulary_id", setId)
    .limit(9999999);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return count || 0;
};

/**
 * Tìm word theo word text (không cần accessToken, dùng supabase admin).
 * @param {string} word
 * @returns {Promise<Object|null>}
 */
const findWordByText = async (word) => {
  const normalizedWord = word.toLowerCase().trim();

  const { data, error } = await supabase
    .from("words")
    .select("*")
    .ilike("word", normalizedWord)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new AppError(error.message, 500);
  }

  return data;
};

/**
 * Tạo word mới.
 * @param {Object} vocabulary
 * @returns {Promise<Object>}
 */
const createWord = async ({ word, phonetic, audioUrl, meaning }) => {
  const normalizedWord = word.toLowerCase().trim();

  const { data, error } = await supabase
    .from("words")
    .insert({
      word: normalizedWord,
      phonetic: phonetic || null,
      audio_url: audioUrl || null,
      meaning,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return null;
    }
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không thể tạo từ vựng", 500);
  }

  return data;
};

/**
 * Thêm nhiều word vào một bộ từ vựng.
 * @param {string} setId - vocabulary_sets.id
 * @param {Array<string>} wordIds - mảng words.id
 * @returns {Promise<void>}
 */
const addWordsToSet = async (setId, wordIds) => {
  if (!wordIds || wordIds.length === 0) return;

  const rows = wordIds.map((wordId) => ({
    vocabulary_id: setId,
    word_id: wordId,
  }));

  const { error } = await supabase
    .from("vocabulary_set_words")
    .upsert(rows, { onConflict: "vocabulary_id,word_id", ignoreDuplicates: true });

  if (error) {
    throw new AppError(error.message, 500);
  }
};

/**
 * Lấy chi tiết một bộ từ vựng theo id.
 * @param {string} setId
 * @returns {Promise<Object|null>}
 */
const findById = async (setId) => {
  const { data, error } = await supabase
    .from("vocabulary_sets")
    .select("*")
    .eq("id", setId)
    .eq("deleted", false)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new AppError(error.message, 500);
  }

  return data;
};

/**
 * Lấy danh sách từ vựng trong một bộ từ vựng (có phân trang).
 * @param {string} setId
 * @param {Object} options
 * @param {number} options.page - Trang (bắt đầu từ 1)
 * @param {number} options.limit - Số từ mỗi trang (mặc định 15)
 * @param {string} options.sortField - Trường sắp xếp: "created_at" | "word"
 * @param {string} options.sortOrder - Thứ tự sắp xếp: "asc" | "desc"
 * @returns {Promise<{words: Array, total: number}>}
 */
const getWordsInSet = async (setId, { page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { sortColumn, ascending } = parseSortParams({
    sortField,
    sortOrder,
    allowedFields: ["created_at", "word"],
    defaultField: "word",
    defaultOrder: "asc",
  });

  const [dataResult, countResult] = await Promise.all([
    supabase
      .from("vocabulary_set_words")
      .select(`
        word_id,
        created_at,
        words (
          id,
          word,
          meaning,
          phonetic,
          audio_url,
          created_at
        )
      `)
      .eq("vocabulary_id", setId)
      .range(from, to),
    supabase
      .from("vocabulary_set_words")
      .select("*", { count: "exact", head: true })
      .eq("vocabulary_id", setId),
  ]);

  if (dataResult.error) {
    throw new AppError(dataResult.error.message, 500);
  }

  let rows = (dataResult.data || []).map((row) => ({
    id: row.words.id,
    word: row.words.word,
    meaning: row.words.meaning,
    phonetic: row.words.phonetic,
    audioUrl: row.words.audio_url,
    createdAt: row.words.created_at,
  }));

  rows.sort((a, b) => {
    const valA = sortColumn === "word" ? a.word : a.createdAt;
    const valB = sortColumn === "word" ? b.word : b.createdAt;
    const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
    return ascending ? cmp : -cmp;
  });

  const total = countResult.count || 0;
  return { words: rows, total };
};

/**
 * Xóa nhiều từ khỏi một bộ từ vựng.
 * @param {string} setId - vocabulary_sets.id
 * @param {Array<string>} wordIds - mảng words.id cần xóa
 * @returns {Promise<void>}
 */
const removeWordsFromSet = async (setId, wordIds) => {
  if (!wordIds || wordIds.length === 0) return;

  const { error } = await supabase
    .from("vocabulary_set_words")
    .delete()
    .eq("vocabulary_id", setId)
    .in("word_id", wordIds);

  if (error) {
    throw new AppError(error.message, 500);
  }
};

/**
 * Cập nhật trạng thái vocabulary set.
 * @param {string} id
 * @param {string} status
 * @returns {Promise<Object>}
 */
const updateStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("vocabulary_sets")
    .update({ status })
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
 * Lấy danh sách bộ từ vựng đang chờ duyệt public (status = 'req_public').
 * Dùng cho admin/content_manager duyệt yêu cầu.
 * @param {Object} options
 * @param {string} options.keyword - Từ khóa tìm kiếm theo title
 * @param {number} options.page - Trang (bắt đầu từ 1)
 * @param {number} options.limit - Số item mỗi trang (max 15)
 * @returns {Promise<{data: Array, total: number}>}
 */
const getPendingPublicSets = async ({ keyword, page = 1, limit = 15 }) => {
  const safeLimit = Math.min(Math.max(1, limit), 15);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("vocabulary_sets")
    .select("id, title, description, status, created_by, created_at", { count: "exact" })
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
 * Lấy thông tin cơ bản của vocabulary set (id, title, description).
 * Dùng khi cần join với bảng khác, không cần full data.
 * @param {string} setId
 * @returns {Promise<Object|null>}
 */
const getVocabularySetById = async (setId) => {
  const { data, error } = await supabase
    .from("vocabulary_sets")
    .select("id, title, description")
    .eq("id", setId)
    .eq("deleted", false)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new AppError(error.message, 500);
  }

  return data;
};

module.exports = {
  create, update, softDelete, getMySets, getPublicSets, countWordsInSet,
  findWordByText, createWord, addWordsToSet, findById, getWordsInSet,
  removeWordsFromSet, updateStatus, getPendingPublicSets,
  getVocabularySetById,
};
