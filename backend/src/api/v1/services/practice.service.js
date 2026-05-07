const vocabularySetModel = require("../repositories/vocabularySet.model");
const practiceModel = require("../repositories/practice.model");
const { AppError } = require("../../../utils/appError");

/**
 * Chuẩn hóa đáp án để so sánh (bỏ dấu, khoảng trắng thừa, lowercase).
 * @param {string} answer
 * @returns {string}
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
 * @param {string} setId
 * @returns {Promise<Map<string, Object>>} - Map từ wordId -> { id, word, meaning, phonetic }
 */
const getWordMap = async (setId) => {
  const words = await vocabularySetModel.getWordsInSet(setId);
  const wordMap = new Map();
  for (const w of words) {
    wordMap.set(w.id, w);
  }
  return wordMap;
};

/**
 * So sánh đáp án user với đáp án đúng (bỏ dấu, không phân biệt hoa thường).
 * @param {string} userAnswer
 * @param {string} correctAnswer
 * @returns {boolean}
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
 *
 * @param {string} userId - ID người dùng
 * @param {string} setId - ID bộ từ vựng
 * @param {string} type - Loại bài luyện tập
 * @param {number} timeSpent - Thời gian hoàn thành (giây)
 * @param {Array} answers - Danh sách đáp án [{ wordId, answer }]
 * @returns {Promise<Object>}
 */
const submitPractice = async (userId, setId, type, timeSpent, answers) => {
  const vocabularySet = await vocabularySetModel.findById(setId);
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
    // quiz/listening_quiz: đáp án là nghĩa tiếng Việt → so sánh với meaning
    for (const item of answers) {
      const wordData = wordMap.get(item.wordId);
      if (!wordData) continue;

      const isCorrect = gradeTextAnswer(item.answer, wordData.meaning);
      if (isCorrect) {
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
    // translate_write/listen_write: nhập từ tiếng Anh → so sánh với word
    for (const item of answers) {
      const wordData = wordMap.get(item.wordId);
      if (!wordData) continue;

      const isCorrect = gradeTextAnswer(item.answer, wordData.word);
      if (isCorrect) {
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

  const result = await practiceModel.createPracticeResult({
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
 * @param {string} userId
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<Object>}
 */
const getPracticeHistory = async (userId, { page = 1, limit = 10 } = {}) => {
  const { data, total } = await practiceModel.getUserPracticeHistory(userId, { page, limit });

  const safeLimit = Math.min(Math.max(1, limit), 20);
  const totalPages = Math.ceil(total / safeLimit);

  const items = await Promise.all(
    data.map(async (item) => {
      let vocabularyTitle = null;
      if (item.vocabulary_id) {
        const vocabSet = await vocabularySetModel.getVocabularySetById(item.vocabulary_id);
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

  return {
    items,
    pagination: {
      page,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
};

module.exports = {
  submitPractice,
  getPracticeHistory,
  normalizeAnswer,
  gradeTextAnswer,
};
