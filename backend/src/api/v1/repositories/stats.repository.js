const { createAdminClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Đếm số người dùng theo role_id.
 */
const countUsersByRoleId = async (roleId) => {
  const client = createAdminClient();

  const { count, error } = await client
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role_id", roleId);

  if (error) {
    console.error("[stats.model] countUsersByRoleId error:", error);
    throw new AppError("Không thể đếm người dùng theo vai trò", 500);
  }

  return count || 0;
};

/**
 * Đếm số người dùng theo trạng thái.
 */
const countUsersByStatus = async (status) => {
  const client = createAdminClient();

  const { count, error } = await client
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", status);

  if (error) {
    console.error("[stats.model] countUsersByStatus error:", error);
    throw new AppError("Không thể đếm người dùng theo trạng thái", 500);
  }

  return count || 0;
};

/**
 * Đếm số bộ từ vựng.
 * @param {string|null} status - 'public', 'private' hoặc null để đếm tất cả
 */
const countVocabularySets = async (status = null) => {
  const client = createAdminClient();

  let query = client
    .from("vocabulary_sets")
    .select("*", { count: "exact", head: true })
    .eq("deleted", false);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    console.error("[stats.model] countVocabularySets error:", error);
    throw new AppError("Không thể đếm bộ từ vựng", 500);
  }

  return count || 0;
};

/**
 * Đếm số lượt làm bài tập từ vựng.
 */
const countVocabularyPractice = async () => {
  const client = createAdminClient();

  const { count, error } = await client
    .from("vocabulary_practice")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[stats.model] countVocabularyPractice error:", error);
    throw new AppError("Không thể đếm lượt làm bài từ vựng", 500);
  }

  return count || 0;
};

/**
 * Đếm số bài luyện đọc.
 * @param {string|null} status - 'public', 'private' hoặc null để đếm tất cả
 */
const countReadingLessons = async (status = null) => {
  const client = createAdminClient();

  let query = client
    .from("reading_lessons")
    .select("*", { count: "exact", head: true })
    .eq("deleted", false);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    console.error("[stats.model] countReadingLessons error:", error);
    throw new AppError("Không thể đếm bài luyện đọc", 500);
  }

  return count || 0;
};

/**
 * Đếm số lượt làm bài luyện đọc.
 */
const countReadingPractice = async () => {
  const client = createAdminClient();

  const { count, error } = await client
    .from("reading_practice")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[stats.model] countReadingPractice error:", error);
    throw new AppError("Không thể đếm lượt làm bài luyện đọc", 500);
  }

  return count || 0;
};

/**
 * Đếm số bài luyện nghe.
 * @param {string|null} status - 'public', 'private' hoặc null để đếm tất cả
 */
const countListeningLessons = async (status = null) => {
  const client = createAdminClient();

  let query = client
    .from("listening_lessons")
    .select("*", { count: "exact", head: true })
    .eq("deleted", false);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    console.error("[stats.model] countListeningLessons error:", error);
    throw new AppError("Không thể đếm bài luyện nghe", 500);
  }

  return count || 0;
};

/**
 * Đếm số lượt làm bài luyện nghe.
 */
const countListeningPractice = async () => {
  const client = createAdminClient();

  const { count, error } = await client
    .from("listening_practice")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[stats.model] countListeningPractice error:", error);
    throw new AppError("Không thể đếm lượt làm bài luyện nghe", 500);
  }

  return count || 0;
};

module.exports = {
  countUsersByRoleId,
  countUsersByStatus,
  countVocabularySets,
  countVocabularyPractice,
  countReadingLessons,
  countReadingPractice,
  countListeningLessons,
  countListeningPractice,
};
