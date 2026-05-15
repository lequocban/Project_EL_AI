const readingQuestionRepository = require("../repositories/readingQuestion.repository");
const { AppError } = require("../../../utils/appError");

/**
 * Kiểm tra quyền sở hữu lesson.
 * @param {string} lessonId
 * @param {string} userId
 */
const checkLessonOwnership = async (lessonId, userId) => {
  const lesson = await readingQuestionRepository.findLessonById(lessonId);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.deleted) {
    throw new AppError("Bài luyện đọc đã bị xóa", 404);
  }

  if (lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền thao tác với bài luyện đọc này", 403);
  }

  return lesson;
};

/**
 * Format response cho một câu hỏi.
 * @param {Object} question
 * @returns {Object}
 */
const formatQuestion = (question) => ({
  id: question.id,
  lessonId: question.lesson_id,
  question: question.question,
  optionA: question.option_a,
  optionB: question.option_b,
  optionC: question.option_c,
  optionD: question.option_d,
  correctAnswer: question.correct_answer,
  explain: question.explain,
  createdAt: question.created_at,
});

/**
 * Tạo câu hỏi mới cho một lesson.
 * Chỉ chủ sở hữu lesson mới được tạo câu hỏi.
 */
const createQuestion = async (userId, { lesson_id, question, option_a, option_b, option_c, option_d, correct_answer, explain }) => {
  if (!lesson_id) {
    throw new AppError("Vui lòng cung cấp lesson_id", 400);
  }

  await checkLessonOwnership(lesson_id, userId);

  if (!question || !question.trim()) {
    throw new AppError("Vui lòng nhập nội dung câu hỏi", 400);
  }

  if (question.trim().length > 2000) {
    throw new AppError("Câu hỏi không được dài quá 2000 ký tự", 400);
  }

  const validOptions = [option_a, option_b, option_c, option_d].filter(Boolean);
  if (validOptions.length < 2) {
    throw new AppError("Cần ít nhất 2 đáp án", 400);
  }

  for (const opt of validOptions) {
    if (opt.trim().length > 1000) {
      throw new AppError("Mỗi đáp án không được dài quá 1000 ký tự", 400);
    }
  }

  if (!correct_answer || !correct_answer.trim()) {
    throw new AppError("Vui lòng cung cấp đáp án đúng", 400);
  }

  const normalizedCorrect = correct_answer.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(normalizedCorrect)) {
    throw new AppError("Đáp án đúng phải là A, B, C hoặc D", 400);
  }

  if (explain && explain.trim().length > 2000) {
    throw new AppError("Giải thích không được dài quá 2000 ký tự", 400);
  }

  const created = await readingQuestionRepository.create({
    lesson_id,
    question: question.trim(),
    option_a: option_a?.trim() || null,
    option_b: option_b?.trim() || null,
    option_c: option_c?.trim() || null,
    option_d: option_d?.trim() || null,
    correct_answer: normalizedCorrect,
    explain: explain?.trim() || null,
  });

  return formatQuestion(created);
};

/**
 * Tạo nhiều câu hỏi cùng lúc cho một lesson.
 */
const createManyQuestions = async (userId, lessonId, questions) => {
  if (!lessonId) {
    throw new AppError("Vui lòng cung cấp lesson_id", 400);
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new AppError("Vui lòng cung cấp danh sách câu hỏi", 400);
  }

  if (questions.length > 50) {
    throw new AppError("Mỗi lần tạo tối đa 50 câu hỏi", 400);
  }

  await checkLessonOwnership(lessonId, userId);

  for (const [index, q] of questions.entries()) {
    if (!q.question || !q.question.trim()) {
      throw new AppError(`Câu hỏi thứ ${index + 1}: Vui lòng nhập nội dung câu hỏi`, 400);
    }

    const validOptions = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
    if (validOptions.length < 2) {
      throw new AppError(`Câu hỏi thứ ${index + 1}: Cần ít nhất 2 đáp án`, 400);
    }

    if (!q.correct_answer || !q.correct_answer.trim()) {
      throw new AppError(`Câu hỏi thứ ${index + 1}: Vui lòng cung cấp đáp án đúng`, 400);
    }

    const normalized = q.correct_answer.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(normalized)) {
      throw new AppError(`Câu hỏi thứ ${index + 1}: Đáp án đúng phải là A, B, C hoặc D`, 400);
    }
  }

  const formatted = questions.map((q) => ({
    ...q,
    correct_answer: q.correct_answer.trim().toUpperCase(),
  }));

  const created = await readingQuestionRepository.createMany(lessonId, formatted);
  return created.map(formatQuestion);
};

/**
 * Cập nhật câu hỏi.
 * Chỉ chủ sở hữu lesson mới được cập nhật câu hỏi.
 */
const updateQuestion = async (userId, id, { question, option_a, option_b, option_c, option_d, correct_answer, explain }) => {
  const existing = await readingQuestionRepository.findById(id);

  if (!existing) {
    throw new AppError("Không tìm thấy câu hỏi", 404);
  }

  await checkLessonOwnership(existing.lesson_id, userId);

  if (question !== undefined) {
    if (!question || !question.trim()) {
      throw new AppError("Câu hỏi không được để trống", 400);
    }
    if (question.trim().length > 2000) {
      throw new AppError("Câu hỏi không được dài quá 2000 ký tự", 400);
    }
  }

  const optionsToCheck = [option_a, option_b, option_c, option_d];
  const currentOptions = [existing.option_a, existing.option_b, existing.option_c, existing.option_d];
  const mergedOptions = optionsToCheck.map((opt, i) => (opt !== undefined ? opt : currentOptions[i]));

  if (question !== undefined) {
    const validOptions = mergedOptions.filter(Boolean);
    if (validOptions.length < 2) {
      throw new AppError("Cần ít nhất 2 đáp án", 400);
    }
  }

  if (correct_answer !== undefined) {
    if (!correct_answer || !correct_answer.trim()) {
      throw new AppError("Đáp án đúng không được để trống", 400);
    }
    const normalized = correct_answer.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(normalized)) {
      throw new AppError("Đáp án đúng phải là A, B, C hoặc D", 400);
    }
  }

  if (explain !== undefined && explain && explain.trim().length > 2000) {
    throw new AppError("Giải thích không được dài quá 2000 ký tự", 400);
  }

  const updated = await readingQuestionRepository.update(id, {
    question: question?.trim(),
    option_a: option_a?.trim(),
    option_b: option_b?.trim(),
    option_c: option_c?.trim(),
    option_d: option_d?.trim(),
    correct_answer: correct_answer?.trim().toUpperCase(),
    explain: explain?.trim(),
  });

  return formatQuestion(updated);
};

/**
 * Xóa câu hỏi.
 * Chỉ chủ sở hữu lesson mới được xóa câu hỏi.
 */
const deleteQuestion = async (userId, id) => {
  const existing = await readingQuestionRepository.findById(id);

  if (!existing) {
    throw new AppError("Không tìm thấy câu hỏi", 404);
  }

  await checkLessonOwnership(existing.lesson_id, userId);

  const deleted = await readingQuestionRepository.deleteById(id);
  return formatQuestion(deleted);
};

/**
 * Xóa nhiều câu hỏi.
 */
const deleteManyQuestions = async (userId, ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Vui lòng cung cấp danh sách câu hỏi cần xóa", 400);
  }

  if (ids.length > 100) {
    throw new AppError("Mỗi lần xóa tối đa 100 câu hỏi", 400);
  }

  // Kiểm tra quyền của tất cả các câu hỏi
  for (const id of ids) {
    const existing = await readingQuestionRepository.findById(id);
    if (!existing) {
      throw new AppError(`Không tìm thấy câu hỏi với id: ${id}`, 404);
    }
    await checkLessonOwnership(existing.lesson_id, userId);
  }

  await readingQuestionRepository.deleteMany(ids);
};

/**
 * Lấy danh sách câu hỏi của một lesson.
 * Ai cũng xem được với lesson public.
 * Chủ sở hữu xem được với lesson private/req_public.
 */
const getQuestionsByLesson = async (userId, lessonId) => {
  const lesson = await readingQuestionRepository.findLessonById(lessonId);

  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  if (lesson.deleted) {
    throw new AppError("Bài luyện đọc đã bị xóa", 404);
  }

  if (lesson.status !== "public" && lesson.created_by !== userId) {
    throw new AppError("Bạn không có quyền xem câu hỏi của bài luyện đọc này", 403);
  }

  const questions = await readingQuestionRepository.findByLessonId(lessonId);
  return questions.map(formatQuestion);
};

module.exports = {
  createQuestion,
  createManyQuestions,
  updateQuestion,
  deleteQuestion,
  deleteManyQuestions,
  getQuestionsByLesson,
  formatQuestion,
};
