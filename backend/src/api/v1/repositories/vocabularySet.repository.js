const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");
const { parseSortParams, buildSupabaseOrder } = require("../../../utils/sorting");
const { buildPaginationRange } = require("../../../utils/pagination");
const { softDeleteRecord, findByIdRecord, updateStatusRecord } = require("../../../utils/baseRepository");

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

const vocabularySetSoftDelete = async (id) => {
  return softDeleteRecord(supabase, "vocabulary_sets", id, "Không tìm thấy bộ từ vựng");
};

const getMySets = async (userId, { keyword, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 15);

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

const getPublicSets = async ({ keyword, page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 15);

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

const vocabularySetFindById = async (setId) => {
  return findByIdRecord(supabase, "vocabulary_sets", setId);
};

const getWordsInSet = async (setId, { page = 1, limit = 15, sortField, sortOrder } = {}) => {
  const { from, to, safeLimit } = buildPaginationRange(page, limit, 100);

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

const vocabularySetUpdateStatus = async (id, status) => {
  return updateStatusRecord(supabase, "vocabulary_sets", id, status, "Không tìm thấy bộ từ vựng");
};

const getPendingPublicSets = async ({ keyword, page = 1, limit = 15 } = {}) => {
  const { from, to } = buildPaginationRange(page, limit, 15);

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
  create,
  update,
  vocabularySetSoftDelete,
  getMySets,
  getPublicSets,
  countWordsInSet,
  findWordByText,
  createWord,
  addWordsToSet,
  vocabularySetFindById,
  getWordsInSet,
  removeWordsFromSet,
  vocabularySetUpdateStatus,
  getPendingPublicSets,
  getVocabularySetById,
};
