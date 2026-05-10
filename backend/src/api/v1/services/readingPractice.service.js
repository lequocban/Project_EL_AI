const readingPracticeModel = require("../repositories/readingPractice.model");
const readingLessonModel = require("../repositories/readingLesson.model");
const readingQuestionModel = require("../repositories/readingQuestion.model");
const { AppError } = require("../../../utils/appError");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");

/**
 * Chuẩn hóa đáp án để so sánh (bỏ dấu, khoảng trắng thừa, lowercase).
 */
const normalizeAnswer = (answer) => {
  if (!answer) return "";
  return answer
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
};

/**
 * So sánh đáp án user với đáp án đúng.
 */
const gradeAnswer = (userAnswer, correctAnswer) => {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  return normalizedUser === normalizedCorrect;
};

/**
 * Nộp bài luyện đọc.
 *
 * Luồng xử lý:
 * 1. Kiểm tra lesson tồn tại
 * 2. Lấy danh sách câu hỏi của lesson
 * 3. Chấm điểm từng câu hỏi
 * 4. Tính điểm tổng
 * 5. Lưu kết quả vào bảng reading_practice
 */
const submitReadingPractice = async (userId, lessonId, answers) => {
  const lesson = await readingLessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError("Không tìm thấy bài luyện đọc", 404);
  }

  const questions = await readingQuestionModel.findByLessonId(lessonId);
  if (questions.length === 0) {
    throw new AppError("Bài luyện đọc không có câu hỏi nào", 400);
  }

  const questionMap = new Map();
  for (const q of questions) {
    questionMap.set(q.id, q);
  }

  let correctCount = 0;
  const results = [];

  for (const item of answers) {
    const question = questionMap.get(item.questionId);
    if (!question) {
      results.push({
        questionId: item.questionId,
        userAnswer: item.answer,
        correctAnswer: null,
        isCorrect: false,
        isSkipped: true,
      });
      continue;
    }

    const isCorrect = gradeAnswer(item.answer, question.correct_answer);
    if (isCorrect) {
      correctCount++;
    }

    results.push({
      questionId: item.questionId,
      userAnswer: item.answer,
      correctAnswer: question.correct_answer,
      isCorrect,
      isSkipped: false,
    });
  }

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const userAnswerJson = JSON.stringify(answers);

  const savedResult = await readingPracticeModel.create({
    userId,
    lessonId,
    userAnswer: userAnswerJson,
    score,
  });

  return {
    practiceId: savedResult.id,
    score,
    totalQuestions,
    correctCount,
    wrongCount: totalQuestions - correctCount,
    results,
    completedAt: savedResult.complete_at,
  };
};

/**
 * Lấy lịch sử luyện đọc của user (có phân trang, sắp xếp).
 */
const getPracticeHistory = async (userId, { page = 1, limit = 10, sortField, sortOrder } = {}) => {
  const { data, total } = await readingPracticeModel.getHistoryByUser(userId, { page, limit, sortField, sortOrder });

  const items = await Promise.all(
    data.map(async (item) => {
      let lessonTitle = null;
      if (item.lesson_id) {
        const lesson = await readingLessonModel.findById(item.lesson_id);
        lessonTitle = lesson?.title || null;
      }
      return {
        id: item.id,
        score: item.score,
        completedAt: item.complete_at,
        lessonTitle,
        lessonId: item.lesson_id,
      };
    })
  );

  return buildPaginationResponse(items, { page, limit, total, maxLimit: 20 });
};

/**
 * Lấy chi tiết một bài luyện đọc đã làm.
 * Chỉ chủ nhân mới được xem chi tiết bài làm của mình.
 */
const getPracticeDetail = async (practiceId, userId) => {
  const practice = await readingPracticeModel.findById(practiceId);
  if (!practice) {
    throw new AppError("Không tìm thấy kết quả luyện đọc", 404);
  }

  if (practice.user_id !== userId) {
    throw new AppError("Bạn không có quyền xem kết quả này", 403);
  }

  const lesson = await readingLessonModel.findById(practice.lesson_id);
  const questions = await readingQuestionModel.findByLessonId(practice.lesson_id);

  let userAnswers = [];
  try {
    userAnswers = JSON.parse(practice.user_answer || "[]");
  } catch {
    userAnswers = [];
  }

  const answerMap = new Map();
  for (const a of userAnswers) {
    answerMap.set(a.questionId, a.answer);
  }

  const questionMap = new Map();
  for (const q of questions) {
    questionMap.set(q.id, q);
  }

  let correctCount = 0;
  const questionResults = [];

  for (const question of questions) {
    const userAnswer = answerMap.get(question.id) || null;
    const isCorrect = userAnswer ? gradeAnswer(userAnswer, question.correct_answer) : false;
    if (isCorrect) correctCount++;

    questionResults.push({
      questionId: question.id,
      question: question.question,
      options: {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d,
      },
      userAnswer,
      correctAnswer: question.correct_answer,
      explain: question.explain,
      isCorrect,
    });
  }

  return {
    practiceId: practice.id,
    score: practice.score,
    totalQuestions: questions.length,
    correctCount,
    wrongCount: questions.length - correctCount,
    lesson: lesson
      ? {
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          viTranslation: lesson.vi_translation,
        }
      : null,
    questions: questionResults,
    completedAt: practice.complete_at,
  };
};

module.exports = {
  submitReadingPractice,
  getPracticeHistory,
  getPracticeDetail,
  normalizeAnswer,
  gradeAnswer,
};
