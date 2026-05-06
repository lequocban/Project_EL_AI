const { AppError } = require("../../../utils/appError");

// Số từ mặc định AI sẽ sinh ra
const DEFAULT_WORD_COUNT = 10;

// Model AI sử dụng (miễn phí, hoạt động ổn định)
const AI_MODELS = [
  "google/gemma-3-4b-it",
  "google/gemma-4-31b-it:free",
  "anthropic/claude-3-haiku:free",
];

/**
 * Sinh từ vựng bằng AI từ OpenRouter.
 * Gọi model google/gemma-4-31b-it:free để tạo danh sách từ theo chủ đề.
 * Nếu bị rate limit sẽ thử model dự phòng.
 *
 * @param {string} topic - Chủ đề từ vựng người dùng mô tả
 * @param {number} [wordCount] - Số từ muốn sinh (mặc định: 10, tối đa: 30)
 * @returns {Promise<string[]>} - Mảng các từ tiếng Anh
 */
const generateVocabularyByAI = async (topic, wordCount = DEFAULT_WORD_COUNT) => {
  if (!topic || !topic.trim()) {
    throw new AppError("Vui lòng nhập chủ đề từ vựng", 400);
  }

  const safeCount = Math.min(Math.max(1, parseInt(wordCount, 10) || DEFAULT_WORD_COUNT), 30);

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new AppError("API_KEY chưa được cấu hình", 500);
  }

  const systemPrompt = `Bạn là một trợ lý tiếng Anh chuyên nghiệp. Nhiệm vụ của bạn là tạo danh sách từ vựng tiếng Anh theo chủ đề cho người học.

YÊU CẦU:
- Chỉ trả về một mảng JSON các từ tiếng Anh, KHÔNG có giải thích gì thêm.
- Mỗi từ phải phổ biến, phù hợp với người học trung cấp trở lên.
- KHÔNG trả về các từ đã có trong câu hỏi.
- KHÔNG thêm mô tả, giải thích, hay markdown code block.

ĐỊNH DẠNG TRẢ VỀ (bắt buộc):
Trả về JSON array chuỗi, ví dụ: ["word1", "word2", "word3"]

QUAN TRỌNG:
- Chỉ trả về mảng JSON thuần túy, không có gì khác.
- Nếu chủ đề không rõ ràng, hãy chọn 10 từ phổ biến nhất liên quan.
- Mỗi từ phải là một chuỗi đơn (không phải cụm từ).`;

  const userPrompt = `Hãy tạo danh sách ${safeCount} từ tiếng Anh phổ biến theo chủ đề sau:

"${topic.trim()}"

Trả về đúng ${safeCount} từ tiếng Anh phổ biến và hữu ích nhất cho người học.`;

  const models = AI_MODELS;
  let lastError = null;

  for (const model of models) {
    try {
      return await callOpenRouter(apiKey, model, systemPrompt, userPrompt, safeCount);
    } catch (error) {
      lastError = error;
      
      // Chỉ thử model tiếp theo nếu bị rate limit (429) hoặc service unavailable (503)
      if (error.statusCode === 429 || error.statusCode === 503) {
        console.warn(`Model ${model} bị rate limit, thử model tiếp theo...`);
        continue;
      }
      
      // Các lỗi khác thì throw ngay
      throw error;
    }
  }

  // Nếu đã thử hết models mà vẫn lỗi
  throw lastError;
};

/**
 * Gọi OpenRouter API với model cụ thể.
 * @param {string} apiKey
 * @param {string} model
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {number} safeCount
 * @returns {Promise<string[]>}
 */
const callOpenRouter = async (apiKey, model, systemPrompt, userPrompt, safeCount) => {
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
      temperature: 0.7,
      max_tokens: 500,
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

    // Tạo AppError với statusCode để nhận biết loại lỗi
    const err = new AppError(`Lỗi từ dịch vụ AI (${response.status}): ${errorDetail}`, 502);
    err.statusCode = response.status;
    throw err;
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new AppError("Phản hồi từ AI không hợp lệ", 502);
  }

  const rawContent = data.choices[0].message.content.trim();

  let words = [];

  // Parse JSON từ response của AI
  try {
    // Thử parse trực tiếp nếu AI trả về JSON array thuần
    words = JSON.parse(rawContent);
  } catch {
    // Nếu AI trả về có markdown code block, tách lấy phần trong block
    const jsonMatch = rawContent.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        words = JSON.parse(jsonMatch[0]);
      } catch {
        // Nếu vẫn không parse được, thử cách khác
        const cleaned = rawContent
          .replace(/```json\n?/gi, "")
          .replace(/```\n?/gi, "")
          .replace(/^\s*\[\s*/, "[")
          .replace(/\s*\]\s*$/, "]");
        words = JSON.parse(cleaned);
      }
    } else {
      // Fallback: tách từng dòng
      const lines = rawContent.split("\n").filter(Boolean);
      words = lines
        .map((line) => line.replace(/^[-"*.\d\s]+/, "").trim().replace(/,$/, ""))
        .filter((w) => w.length > 0 && /^[a-zA-Z]+$/.test(w))
        .slice(0, safeCount);
    }
  }

  // Đảm bảo words là array và chỉ chứa string
  if (!Array.isArray(words)) {
    throw new AppError("AI trả về định dạng không hợp lệ", 502);
  }

  // Chuẩn hóa: loại bỏ empty, trim, lowercase
  const normalizedWords = words
    .map((w) => String(w).toLowerCase().trim())
    .filter((w) => w.length > 0 && /^[a-zA-Z]+$/.test(w));

  if (normalizedWords.length === 0) {
    throw new AppError("AI không trả về từ vựng hợp lệ", 502);
  }

  // Loại bỏ trùng lặp
  return [...new Set(normalizedWords)];
};

module.exports = {
  generateVocabularyByAI,
  DEFAULT_WORD_COUNT,
  AI_MODELS,
};
