const vocabularySetRepository = require("../repositories/vocabularySet.repository");
const practiceRepository = require("../repositories/practice.repository");
const { AppError } = require("../../../utils/appError");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");

/**
 * Chuẩn hóa đáp án để so sánh (bỏ dấu, khoảng trắng thừa, lowercase).
 */
const normalizeAnswer = (answer) => {
  if (!answer) return "";
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
};

/**
 * Lấy danh sách từ trong bộ từ vựng để đối chiếu đáp án.
 */
const getWordMap = async (setId) => {
  const { words } = await vocabularySetRepository.getWordsInSet(setId);
  const wordMap = new Map();
  for (const w of words) {
    wordMap.set(w.id, w);
  }
  return wordMap;
};

/**
 * So sánh đáp án user với đáp án đúng (bỏ dấu, không phân biệt hoa thường).
 */
const gradeTextAnswer = (userAnswer, correctAnswer) => {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  return normalizedUser === normalizedCorrect;
};

/**
 * Nộp bài luyện tập từ vựng.
 *
 * 4 dạng bài tập:
 * - quiz: Câu hỏi tiếng Anh → đáp án nghĩa tiếng Việt
 * - listening_quiz: Audio → đáp án nghĩa tiếng Việt
 * - translate_write: Câu hỏi tiếng Việt → nhập từ tiếng Anh
 * - listen_write: Nghe audio → nhập từ tiếng Anh
 */
const submitPractice = async (userId, setId, type, timeSpent, answers) => {
  const vocabularySet = await vocabularySetRepository.vocabularySetFindById(setId);
  if (!vocabularySet) {
    throw new AppError("Không tìm thấy bộ từ vựng", 404);
  }

  const wordMap = await getWordMap(setId);
  if (wordMap.size === 0) {
    throw new AppError("Bộ từ vựng không có từ nào để luyện tập", 400);
  }

  const wrongWords = [];
  let correctCount = 0;

  if (type === "quiz" || type === "listening_quiz") {
    for (const item of answers) {
      const wordData = wordMap.get(item.wordId);
      if (!wordData) continue;

      if (gradeTextAnswer(item.answer, wordData.meaning)) {
        correctCount++;
      } else {
        wrongWords.push({
          word_id: item.wordId,
          word: wordData.word,
          user_answer: item.answer,
          correct_answer: wordData.meaning,
        });
      }
    }
  } else if (type === "translate_write" || type === "listen_write") {
    for (const item of answers) {
      const wordData = wordMap.get(item.wordId);
      if (!wordData) continue;

      if (gradeTextAnswer(item.answer, wordData.word)) {
        correctCount++;
      } else {
        wrongWords.push({
          word_id: item.wordId,
          word: wordData.word,
          meaning: wordData.meaning,
          user_answer: item.answer,
          correct_answer: wordData.word,
        });
      }
    }
  }

  const totalQuestions = wordMap.size;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const result = await practiceRepository.createPracticeResult({
    userId,
    vocabularyId: setId,
    type,
    score,
    timeSpent: timeSpent || 0,
    wrongWords,
  });

  return {
    practiceId: result.id,
    score,
    totalQuestions,
    correctCount,
    wrongCount: totalQuestions - correctCount,
    wrongWords,
    timeSpent,
    completedAt: result.complete_at,
  };
};

/**
 * Lấy lịch sử luyện tập của user (có phân trang).
 */
const getPracticeHistory = async (userId, { page = 1, limit = 10 } = {}) => {
  const { data, total } = await practiceRepository.getUserPracticeHistory(userId, { page, limit });

  const items = await Promise.all(
    data.map(async (item) => {
      let vocabularyTitle = null;
      if (item.vocabulary_id) {
        const vocabSet = await vocabularySetRepository.getVocabularySetById(item.vocabulary_id);
        vocabularyTitle = vocabSet?.title || null;
      }
      return {
        id: item.id,
        score: item.score,
        type: item.type,
        timeSpent: item.time_spent,
        wrongWords: item.wrong_words,
        completedAt: item.complete_at,
        vocabularySetTitle: vocabularyTitle,
      };
    })
  );

  return buildPaginationResponse(items, { page, limit, total, maxLimit: 20 });
};

module.exports = {
  submitPractice,
  getPracticeHistory,
  normalizeAnswer,
  gradeTextAnswer,
};
