const { supabase } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Tìm từ vựng theo word.
 * @param {string} word
 * @returns {Promise<Object|null>}
 */
const findByWord = async (word) => {
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
 * Tạo mới một từ vựng.
 * @param {Object} vocabulary
 * @param {string} vocabulary.word
 * @param {string} vocabulary.phonetic
 * @param {string} vocabulary.audioUrl
 * @param {string} vocabulary.meaning
 * @returns {Promise<Object>}
 */
const create = async ({ word, phonetic, audioUrl, meaning }) => {
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
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new AppError("Từ vựng này đã tồn tại", 409);
    }
    throw new AppError(error.message, 500);
  }

  return data;
};

module.exports = {
  findByWord,
  create,
};
