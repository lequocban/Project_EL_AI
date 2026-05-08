const aiService = require("./ai.service");
const listeningLessonModel = require("../repositories/listeningLesson.model");
const listeningQuestionModel = require("../repositories/listeningQuestion.model");
const { AppError } = require("../../../utils/appError");

/**
 * Format response listening lesson.
 * @param {Object} lesson
 * @returns {Object}
 */
const formatLesson = (lesson) => ({
  id: lesson.id,
  title: lesson.title,
  audioUrl: lesson.audio_url,
  transcript: lesson.transcript,
  viTranslation: lesson.vi_translation,
  status: lesson.status,
  createdBy: lesson.created_by,
  createdAt: lesson.created_at,
});

/**
 * Tạo bài luyện nghe bằng AI.
 * Luồng: sinh transcript -> gọi TTS -> upload audio -> lưu lesson -> sinh câu hỏi.
 *
 * @param {string} userId - ID người dùng
 * @param {Object} params
 * @param {string} params.title - Tiêu đề bài luyện nghe
 * @param {string} params.topic - Chủ đề bài luyện nghe
 * @param {number} params.questionCount - Số câu hỏi (1-5)
 * @returns {Promise<Object>}
 */
const createListeningLessonByAI = async (userId, { title, topic, questionCount }) => {
  if (!title || !title.trim()) {
    throw new AppError("Vui lòng nhập tiêu đề bài luyện nghe", 400);
  }

  if (!topic || !topic.trim()) {
    throw new AppError("Vui lòng nhập chủ đề bài luyện nghe", 400);
  }

  const safeCount = Math.min(Math.max(1, parseInt(questionCount, 10) || 5), 5);

  // Bước 1: Sinh transcript và vi_translation bằng AI
  const { transcript, viTranslation } = await aiService.generateListeningTranscriptByAI(title, topic);

  // Bước 2: Sinh audio từ transcript bằng ElevenLabs TTS
  const audioBuffer = await aiService.generateAudioByElevenLabs(transcript);

  // Bước 3: Upload audio lên Supabase Storage
  const audioUrl = await uploadAudioToSupabase(audioBuffer, title);

  // Bước 4: Tạo lesson trong database
  const lesson = await listeningLessonModel.create({
    title: title.trim(),
    audio_url: audioUrl,
    transcript: transcript,
    vi_translation: viTranslation,
    status: "private",
    created_by: userId,
  });

  // Bước 5: Sinh câu hỏi bằng AI
  const questions = await aiService.generateListeningQuestionsByAI(transcript, viTranslation, safeCount);

  // Bước 6: Lưu câu hỏi vào database
  const createdQuestions = await listeningQuestionModel.createMany(lesson.id, questions);

  // Format kết quả trả về
  return {
    lesson: formatLesson(lesson),
    questions: createdQuestions.map((q) => ({
      id: q.id,
      lessonId: q.lesson_id,
      question: q.question,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctAnswer: q.correct_answer,
      explain: q.explain,
      createdAt: q.created_at,
    })),
  };
};

/**
 * Upload audio buffer lên Supabase Storage trong thư mục audio/listening/.
 * @param {Buffer} audioBuffer
 * @param {string} title
 * @returns {Promise<string>} - URL của file audio
 */
const uploadAudioToSupabase = async (audioBuffer, title) => {
  const { createAdminClient } = require("../../../config/supabase");
  const adminClient = createAdminClient();

  const sanitizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);

  const timestamp = Date.now();
  const fileName = `${sanitizedTitle}-${timestamp}.mp3`;
  const filePath = `listening/${fileName}`;

  const { data, error } = await adminClient.storage
    .from("audio")
    .upload(filePath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: false,
    });

  if (error) {
    console.error("Supabase Storage upload error:", error);
    throw new AppError("Không thể upload audio lên Supabase Storage", 500);
  }

  const { data: urlData } = adminClient.storage.from("audio").getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new AppError("Không thể lấy URL của file audio", 500);
  }

  return urlData.publicUrl;
};

module.exports = {
  createListeningLessonByAI,
};
