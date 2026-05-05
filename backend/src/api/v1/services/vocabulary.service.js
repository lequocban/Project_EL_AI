const vocabularyModel = require("../repositories/vocabulary.model");
const { AppError } = require("../../../utils/appError");

/**
 * Gọi Dictionary API để lấy phonetic và audio URL.
 * @param {string} word
 * @returns {Promise<{ phonetic: string, audioUrl: string }>}
 */
const fetchDictionaryData = async (word) => {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new AppError(`Không tìm thấy từ "${word}" trong từ điển`, 404);
    }
    throw new AppError("Không thể lấy dữ liệu từ từ điển", 502);
  }

  const data = await response.json();

  let phonetic = "";
  let audioUrl = "";

  if (data && data.length > 0) {
    const entry = data[0];

    phonetic = entry.phonetic || "";

    if (!phonetic && entry.phonetics && entry.phonetics.length > 0) {
      const phoneticEntry = entry.phonetics.find((p) => p.text);
      if (phoneticEntry) {
        phonetic = phoneticEntry.text;
      }
    }

    if (entry.phonetics && entry.phonetics.length > 0) {
      const audioEntry = entry.phonetics.find((p) => p.audio && p.audio.length > 0);
      if (audioEntry) {
        audioUrl = audioEntry.audio;
      }
    }
  }

  return { phonetic, audioUrl };
};

/**
 * Gọi Google Translate API để lấy nghĩa tiếng Việt.
 * @param {string} word
 * @returns {Promise<string>}
 */
const fetchMeaning = async (word) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(word)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new AppError("Không thể lấy nghĩa từ Google Translate", 502);
  }

  const data = await response.json();

  if (data && data[0] && data[0].length > 0) {
    const translatedText = data[0]
      .map((item) => item[0])
      .join("")
      .trim();
    return translatedText;
  }

  throw new AppError("Không thể phân tích kết quả dịch", 500);
};

/**
 * Format response theo format yêu cầu.
 * @param {Object} vocabulary
 * @returns {Object}
 */
const formatVocabulary = (vocabulary) => {
  return {
    word: vocabulary.word,
    meaning: vocabulary.meaning,
    phonetic: vocabulary.phonetic || "",
    audioUrl: vocabulary.audio_url || "",
    createdAt: vocabulary.created_at,
    updatedAt: vocabulary.updated_at,
  };
};

/**
 * Lookup từ vựng:
 * 1. Tìm trong DB trước
 * 2. Nếu chưa có, gọi Dictionary API + Translate API
 * 3. Lưu vào DB và trả về
 *
 * @param {string} accessToken
 * @param {string} word
 * @returns {Promise<Object>}
 */
const lookupWord = async (accessToken, word) => {
  const normalizedWord = word.toLowerCase().trim();

  if (!normalizedWord) {
    throw new AppError("Vui lòng nhập từ cần tra", 400);
  }

  const existing = await vocabularyModel.findByWord(accessToken, normalizedWord);

  if (existing) {
    return formatVocabulary(existing);
  }

  const [dictionaryData, meaning] = await Promise.all([
    fetchDictionaryData(normalizedWord),
    fetchMeaning(normalizedWord),
  ]);

  const vocabulary = await vocabularyModel.create(accessToken, {
    word: normalizedWord,
    phonetic: dictionaryData.phonetic,
    audioUrl: dictionaryData.audioUrl,
    meaning,
  });

  return formatVocabulary(vocabulary);
};

module.exports = {
  lookupWord,
  fetchDictionaryData,
  fetchMeaning,
  formatVocabulary,
};
