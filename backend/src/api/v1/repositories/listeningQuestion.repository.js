const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Tạo mới một câu hỏi nghe hiểu.
 * @param {Object} data
 * @param {string} data.lesson_id
 * @param {string} data.question
 * @param {string} data.option_a
 * @param {string} data.option_b
 * @param {string} data.option_c
 * @param {string} data.option_d
 * @param {string} data.correct_answer
 * @param {string|null} data.explain
 * @returns {Promise<Object>}
 */
const create = async ({ lesson_id, question, option_a, option_b, option_c, option_d, correct_answer, explain }) => {
  const { data, error } = await supabase
    .from("listening_questions")
    .insert({
      lesson_id,
      question: question?.trim() || null,
      option_a: option_a?.trim() || null,
      option_b: option_b?.trim() || null,
      option_c: option_c?.trim() || null,
      option_d: option_d?.trim() || null,
      correct_answer: correct_answer?.trim() || null,
      explain: explain?.trim() || null,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không thể tạo câu hỏi", 500);
  }

  return data;
};

/**
 * Tạo nhiều câu hỏi cùng lúc cho một lesson.
 * @param {string} lessonId
 * @param {Array<Object>} questions
 * @returns {Promise<Array>}
 */
const createMany = async (lessonId, questions) => {
  const rows = questions.map((q) => ({
    lesson_id: lessonId,
    question: q.question?.trim() || null,
    option_a: q.option_a?.trim() || null,
    option_b: q.option_b?.trim() || null,
    option_c: q.option_c?.trim() || null,
    option_d: q.option_d?.trim() || null,
    correct_answer: q.correct_answer?.trim() || null,
    explain: q.explain?.trim() || null,
  }));

  const { data, error } = await supabase
    .from("listening_questions")
    .insert(rows)
    .select("*");

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data || [];
};

/**
 * Cập nhật câu hỏi theo id.
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const update = async (id, { question, option_a, option_b, option_c, option_d, correct_answer, explain }) => {
  const updateData = {};

  if (question !== undefined) updateData.question = question?.trim() || null;
  if (option_a !== undefined) updateData.option_a = option_a?.trim() || null;
  if (option_b !== undefined) updateData.option_b = option_b?.trim() || null;
  if (option_c !== undefined) updateData.option_c = option_c?.trim() || null;
  if (option_d !== undefined) updateData.option_d = option_d?.trim() || null;
  if (correct_answer !== undefined) updateData.correct_answer = correct_answer?.trim() || null;
  if (explain !== undefined) updateData.explain = explain?.trim() || null;

  const { data, error } = await supabase
    .from("listening_questions")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không tìm thấy câu hỏi", 404);
  }

  return data;
};

/**
 * Xóa câu hỏi theo id.
 * @param {string} id
 * @returns {Promise<Object>}
 */
const deleteById = async (id) => {
  const { data, error } = await supabase
    .from("listening_questions")
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Không tìm thấy câu hỏi", 404);
  }

  return data;
};

/**
 * Xóa nhiều câu hỏi theo danh sách id.
 * @param {Array<string>} ids
 * @returns {Promise<void>}
 */
const deleteMany = async (ids) => {
  if (!ids || ids.length === 0) return;

  const { error } = await supabase
    .from("listening_questions")
    .delete()
    .in("id", ids);

  if (error) {
    throw new AppError(error.message, 500);
  }
};

/**
 * Tìm câu hỏi theo id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  const { data, error } = await supabase
    .from("listening_questions")
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
 * Lấy danh sách câu hỏi theo lesson_id.
 * @param {string} lessonId
 * @returns {Promise<Array>}
 */
const findByLessonId = async (lessonId) => {
  const { data, error } = await supabase
    .from("listening_questions")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data || [];
};

/**
 * Lấy chi tiết lesson theo id (dùng để kiểm tra quyền sở hữu).
 * @param {string} lessonId
 * @returns {Promise<Object|null>}
 */
const findLessonById = async (lessonId) => {
  const { data, error } = await supabase
    .from("listening_lessons")
    .select("id, created_by, status, deleted")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new AppError(error.message, 500);
  }

  return data;
};

module.exports = {
  create,
  createMany,
  update,
  deleteById,
  deleteMany,
  findById,
  findByLessonId,
  findLessonById,
};
