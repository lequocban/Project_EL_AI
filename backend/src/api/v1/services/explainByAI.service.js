const { AppError } = require("../../../utils/appError");

// Model AI sử dụng (miễn phí, ưu tiên model có context window lớn)
const AI_MODELS = [
  "google/gemma-3-4b-it",
  "google/gemma-4-31b-it:free",
  "anthropic/claude-3-haiku:free",
];

/**
 * Gọi OpenRouter API để nhận giải thích chi tiết đáp án.
 * @param {string} apiKey
 * @param {string} model
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
const callOpenRouterForExplain = async (apiKey, model, systemPrompt, userPrompt) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`OpenRouter API error (${model}):`, response.status, errorBody);

    let errorDetail = "Vui lòng thử lại sau.";
    try {
      const errorJson = JSON.parse(errorBody);
      errorDetail = errorJson.error?.message || errorJson.error || errorDetail;
    } catch {
      errorDetail = errorBody.substring(0, 200);
    }

    const err = new AppError(`Lỗi từ dịch vụ AI (${response.status}): ${errorDetail}`, 502);
    err.statusCode = response.status;
    throw err;
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new AppError("Phản hồi từ AI không hợp lệ", 502);
  }

  return data.choices[0].message.content.trim();
};

/**
 * Giải thích chi tiết đáp án bài luyện đọc/nghe bằng AI.
 *
 * @param {Object} params
 * @param {string} params.lessonType - 'reading' hoặc 'listening'
 * @param {string} params.content - Nội dung bài đọc hoặc transcript bài nghe (tiếng Anh)
 * @param {string} params.viTranslation - Bản dịch tiếng Việt của nội dung
 * @param {string} params.question - Câu hỏi
 * @param {Object} params.allAnswers - Tất cả các đáp án { a, b, c, d }
 * @param {string} params.userAnswer - Đáp án người dùng chọn
 * @param {string} params.correctAnswer - Đáp án đúng
 * @returns {Promise<string>} - Giải thích chi tiết bằng tiếng Việt
 */
const explainAnswerByAI = async ({ lessonType, content, viTranslation, question, allAnswers, userAnswer, correctAnswer }) => {
  // Validate input
  if (!lessonType || !["reading", "listening"].includes(lessonType)) {
    throw new AppError("lessonType phải là 'reading' hoặc 'listening'", 400);
  }

  if (!content || !content.trim()) {
    throw new AppError("Nội dung bài không được để trống", 400);
  }

  if (!question || !question.trim()) {
    throw new AppError("Câu hỏi không được để trống", 400);
  }

  if (!allAnswers || !allAnswers.a || !allAnswers.b || !allAnswers.c || !allAnswers.d) {
    throw new AppError("Phải cung cấp đầy đủ 4 đáp án A, B, C, D", 400);
  }

  if (!correctAnswer || !["A", "B", "C", "D"].includes(correctAnswer.toUpperCase())) {
    throw new AppError("Đáp án đúng phải là A, B, C hoặc D", 400);
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AppError("API_KEY chưa được cấu hình", 500);
  }

  const lessonTypeLabel = lessonType === "reading" ? "Luyện đọc" : "Luyện nghe";
  const userAnswerLabel = userAnswer || "(không chọn)";
  const correctAnswerLabel = correctAnswer.toUpperCase();

  // Label đáp án đúng/sai
  const answerLabels = {
    a: "A",
    b: "B",
    c: "C",
    d: "D",
  };

  const systemPrompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp và thân thiện.
Nhiệm vụ của bạn là giải thích chi tiết đáp án cho bài ${lessonTypeLabel} bằng tiếng Việt.

YÊU CẦU:
- Giải thích hoàn toàn BẰNG TIẾNG VIỆT, không dùng tiếng Anh trong phần giải thích chính.
- TRÍCH DẪN CHÍNH XÁC các câu hoặc cụm từ TIẾNG ANH trong bài gốc để minh họa.
- Giải thích phải rõ ràng, dễ hiểu với người học trung cấp.
- Phân tích từ vựng và cấu trúc câu quan trọng trong câu trả lời đúng.
- Chỉ ra lỗi sai phổ biến hoặc điểm dễ nhầm lẫn nếu có.

CẤU TRÚC GIẢI THÍCH:
1. [Tóm tắt câu hỏi] — Dịch câu hỏi ra tiếng Việt một cách ngắn gọn.
2. [Phân tích đáp án đúng] — Giải thích chi tiết tại sao đáp án đúng là đúng, trích dẫn câu/cụm từ tiếng Anh liên quan từ bài đọc/nghe.
3. [Phân tích các đáp án sai] — Giải thích ngắn gọn tại sao các đáp án còn lại SAI hoặc không phù hợp.
4. [Ghi chú từ vựng/ngữ pháp] — Liệt kê 2-3 từ/cụm từ quan trọng trong câu trả lời đúng kèm nghĩa tiếng Việt.

QUAN TRỌNG:
- KHÔNG trả về dạng JSON hay markdown code block, chỉ trả về văn bản thuần túy.
- Trích dẫn tiếng Anh trong dấu ngoặc kép "" và in NGHIÊNG.
- Giải thích phải trung thực với nội dung bài gốc, không bịa đặt.`;

  const viTranslationBlock = viTranslation && viTranslation.trim()
    ? `=== BẢN DỊCH TIẾNG VIỆT ===\n${viTranslation.trim()}\n=== HẾT BẢN DỊCH ===`
    : "(Không có bản dịch tiếng Việt)";

  const userPrompt = `Hãy giải thích chi tiết đáp án cho bài ${lessonTypeLabel} sau:

=== LOẠI BÀI ===
${lessonTypeLabel}
=== HẾT LOẠI BÀI ===

=== NỘI DUNG BÀI ${lessonType === "reading" ? "ĐỌC" : "NGHE"} (TIẾNG ANH) ===
${content.trim()}
=== HẾT NỘI DUNG ===

${viTranslationBlock}

=== CÂU HỎI ===
${question.trim()}
=== HẾT CÂU HỎI ===

=== CÁC ĐÁP ÁN ===
A. ${allAnswers.a}
B. ${allAnswers.b}
C. ${allAnswers.c}
D. ${allAnswers.d}
=== HẾT CÁC ĐÁP ÁN ===

=== THÔNG TIN TRẢ LỜI ===
- Đáp án bạn đã chọn: ${userAnswerLabel}
- Đáp án đúng: ${correctAnswerLabel}
=== HẾT THÔNG TIN ===

Hãy giải thích theo đúng cấu trúc đã yêu cầu trong system prompt.`;

  let lastError = null;

  for (const model of AI_MODELS) {
    try {
      return await callOpenRouterForExplain(apiKey, model, systemPrompt, userPrompt);
    } catch (error) {
      lastError = error;

      if (error.statusCode === 429 || error.statusCode === 503) {
        console.warn(`Model ${model} bị rate limit, thử model tiếp theo...`);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

module.exports = {
  explainAnswerByAI,
  AI_MODELS,
};
