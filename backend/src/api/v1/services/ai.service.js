const { AppError } = require("../../../utils/appError");

// Số từ mặc định AI sẽ sinh ra
const DEFAULT_WORD_COUNT = 10;

// Model AI sử dụng (miễn phí, hoạt động ổn định)
const AI_MODELS = [
  "google/gemma-3-4b-it",
  "google/gemma-4-31b-it:free",
  "deepseek/deepseek-chat-v3:free",
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

/**
 * Gọi OpenRouter API chung.
 * @param {string} apiKey
 * @param {string} model
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {number} maxTokens
 * @returns {Promise<string>}
 */
const callOpenRouterRaw = async (apiKey, model, systemPrompt, userPrompt, maxTokens = 2000) => {
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
      max_tokens: maxTokens,
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
 * Sinh bài đọc hiểu bằng AI từ OpenRouter.
 * Trả về { content, viTranslation }
 *
 * @param {string} title - Tiêu đề bài đọc
 * @param {string} topic - Chủ đề bài đọc
 * @returns {Promise<{content: string, viTranslation: string}>}
 */
const generateReadingLessonByAI = async (title, topic) => {
  if (!topic || !topic.trim()) {
    throw new AppError("Vui lòng nhập chủ đề bài đọc", 400);
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AppError("API_KEY chưa được cấu hình", 500);
  }

  const systemPrompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp, có khả năng viết bài đọc hiểu cho người học.

YÊU CẦU:
- Viết một bài đọc hiểu hoàn chỉnh BẰNG TIẾNG ANH theo chủ đề mà người dùng yêu cầu.
- Bài đọc phải phù hợp với người học tiếng Anh trung cấp (B1-B2).
- Độ dài bài đọc từ 200 đến 350 từ.
- Bài đọc phải có cấu trúc rõ ràng, có ít nhất 3 đoạn văn.
- Không đánh số đoạn văn, không in đậm, không in nghiêng, chỉ viết văn bản thuần túy.
- KHÔNG trả lời bằng markdown code block, chỉ trả về văn bản thuần túy.

ĐỊNH DẠNG TRẢ VỀ:
Trả về JSON object với 2 trường:
{
  "content": "<bài đọc bằng tiếng Anh, không có markdown>",
  "viTranslation": "<bản dịch tiếng Việt của bài đọc trên>"
}

QUAN TRỌNG:
- Chỉ trả về JSON object thuần túy, không có markdown code block, không có giải thích gì thêm.
- Trường "content" chứa bài đọc TIẾNG ANH.
- Trường "viTranslation" chứa bản dịch TIẾNG VIỆT của bài đọc đó.
- Bản dịch tiếng Việt phải sát nghĩa, rõ ràng, tự nhiên.`;

  const userPrompt = `Hãy viết một bài đọc hiểu tiếng Anh theo chủ đề sau:

Tiêu đề bài đọc: "${title.trim()}"
Chủ đề: "${topic.trim()}"

Trả về đúng định dạng JSON với "content" (tiếng Anh) và "viTranslation" (tiếng Việt).`;

  const models = AI_MODELS;
  let lastError = null;

  for (const model of models) {
    try {
      const rawContent = await callOpenRouterRaw(apiKey, model, systemPrompt, userPrompt, 3000);
      return parseJSONResponse(rawContent);
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

/**
 * Sinh câu hỏi đọc hiểu bằng AI từ OpenRouter.
 * Trả về mảng các câu hỏi.
 *
 * @param {string} content - Nội dung bài đọc tiếng Anh
 * @param {string} viTranslation - Bản dịch tiếng Việt của bài đọc
 * @param {number} questionCount - Số câu hỏi muốn sinh (1-5)
 * @returns {Promise<Array>}
 */
const generateReadingQuestionsByAI = async (content, viTranslation, questionCount) => {
  if (!content || !content.trim()) {
    throw new AppError("Nội dung bài đọc không hợp lệ", 400);
  }

  if (!viTranslation || !viTranslation.trim()) {
    throw new AppError("Bản dịch tiếng Việt không hợp lệ", 400);
  }

  const safeCount = Math.min(Math.max(1, parseInt(questionCount, 10) || 5), 5);

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AppError("API_KEY chưa được cấu hình", 500);
  }

  const systemPrompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp, có khả năng tạo câu hỏi đọc hiểu.

YÊU CẦU:
- Tạo đúng ${safeCount} câu hỏi trắc nghiệm (4 lựa chọn) dựa trên bài đọc được cung cấp.
- Mỗi câu hỏi phải kiểm tra kỹ năng đọc hiểu: chi tiết, suy luận, từ vựng, hoặc mục đích tác giả.
- Các đáp án (A, B, C, D) phải có độ dài tương đương, không quá 200 ký tự mỗi đáp án.
- Đáp án đúng phải rõ ràng, không mơ hồ.

ĐỊNH DẠNG TRẢ VỀ:
Trả về JSON array các câu hỏi, mỗi câu hỏi có format:
{
  "question": "<câu hỏi bằng tiếng Anh>",
  "option_a": "<đáp án A tiếng Anh>",
  "option_b": "<đáp án B tiếng Anh>",
  "option_c": "<đáp án C tiếng Anh>",
  "option_d": "<đáp án D tiếng Anh>",
  "correct_answer": "<A hoặc B hoặc C hoặc D>",
  "explain": "<giải thích bằng TIẾNG VIỆT: dịch câu hỏi + các đáp án ra tiếng Việt, chỉ rõ đáp án đúng, giải thích ngắn gọn tại sao đúng/sai>"
}

QUAN TRỌNG:
- Chỉ trả về JSON array thuần túy, không có markdown code block, không có giải thích gì thêm.
- Trường "question" và các option phải bằng TIẾNG ANH.
- Trường "explain" phải bằng TIẾNG VIỆT, có format: [Dịch câu hỏi và đáp án] → Đáp án đúng: [giải thích]
- Ví dụ explain: "Câu hỏi: 'What is the main topic of the passage?' | A: 'Technology' | B: 'Health' | C: 'Education' | D: 'Business' → Đáp án đúng: C. Giải thích: Bài viết chủ yếu nói về giáo dục vì..."
- Đáp án đúng phải nằm trong phần giải thích.`;

  const userPrompt = `Dựa trên bài đọc sau, hãy tạo ${safeCount} câu hỏi trắc nghiệm:

=== BÀI ĐỌC TIẾNG ANH ===
${content.trim()}
=== HẾT BÀI ĐỌC ===

=== BẢN DỊCH TIẾNG VIỆT ===
${viTranslation.trim()}
=== HẾT BẢN DỊCH ===

Tạo đúng ${safeCount} câu hỏi theo định dạng JSON array đã mô tả.`;

  const models = AI_MODELS;
  let lastError = null;

  for (const model of models) {
    try {
      const rawContent = await callOpenRouterRaw(apiKey, model, systemPrompt, userPrompt, 3000);
      return await parseQuestionsResponse(rawContent, safeCount);
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

/**
 * Parse JSON response từ AI cho bài đọc.
 * @param {string} rawContent
 * @returns {{content: string, viTranslation: string}}
 */
const parseJSONResponse = (rawContent) => {
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed.content && parsed.viTranslation) {
      return {
        content: parsed.content.trim(),
        viTranslation: parsed.viTranslation.trim(),
      };
    }
  } catch {
    // Thử extract JSON từ markdown
  }

  // Thử extract JSON từ markdown code block
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.content && parsed.viTranslation) {
        return {
          content: parsed.content.trim(),
          viTranslation: parsed.viTranslation.trim(),
        };
      }
    } catch {
      // continue
    }
  }

  throw new AppError("AI trả về định dạng không hợp lệ cho bài đọc", 502);
};

/**
 * Dịch explain sang tiếng Việt bằng AI.
 * Dịch toàn bộ nội dung, bao gồm cả phần trong dấu nháy.
 * @param {string} explain
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
const translateExplainToVietnamese = async (explain, apiKey) => {
  // Kiểm tra sơ bộ: nếu có dấu tiếng Việt ở cả nhãn lẫn nội dung trong nháy thì coi như đã là tiếng Việt
  const vietnameseChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  // Trích nội dung trong nháy đơn hoặc nháy kép
  const quotedMatches = explain.match(/['"][^'"]+['"]/g) || [];
  const hasVietnameseInQuotes = quotedMatches.some((m) => vietnameseChars.test(m));

  if (vietnameseChars.test(explain) && hasVietnameseInQuotes) {
    return explain;
  }

  const systemPrompt = `Bạn là một dịch giả chuyên nghiệp. Dịch toàn bộ đoạn văn bản sau sang tiếng Việt.
CHỈ trả về bản dịch tiếng Việt, không giải thích gì thêm, không có markdown.

YÊU CẦU:
- Dịch TẤT CẢ nội dung, bao gồm cả phần trong dấu nháy đơn '\'' và nháy kép "\"".
- Giữ nguyên format và cấu trúc của đoạn gốc (các nhãn như "Câu hỏi:", "Đáp án đúng:", "Giải thích:", các ký hiệu như "|", "→", v.v.)
- Nếu đoạn gốc có dạng: Câu hỏi: '...' | A: '...' | B: '...' → Đáp án đúng: C. Giải thích: ...'
  Thì bản dịch phải có dạng: Câu hỏi: '...' | A: '...' | B: '...' → Đáp án đúng: C. Giải thích: ...
  trong đó '...' là bản dịch tiếng Việt của câu hỏi và các đáp án.

VÍ DỤ:
Đầu vào: "Câu hỏi: 'What is the main topic?' | A: 'Technology' | B: 'Health' → Đáp án đúng: B."
Đầu ra:  "Câu hỏi: 'Chủ đề chính là gì?' | A: 'Công nghệ' | B: 'Sức khỏe' → Đáp án đúng: B."`;

  const userPrompt = `Dịch đoạn sau sang tiếng Việt:\n\n${explain}`;

  for (const model of AI_MODELS) {
    try {
      const translated = await callOpenRouterRaw(apiKey, model, systemPrompt, userPrompt, 800);
      const cleaned = translated.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      if (cleaned.length > 0) {
        return cleaned;
      }
    } catch {
      // Thử model khác
    }
  }

  return explain;
};

/**
 * Parse JSON response từ AI cho câu hỏi.
 * Tự động dịch trường explain sang tiếng Việt nếu chưa phải.
 * @param {string} rawContent
 * @param {number} expectedCount
 * @returns {Promise<Array>}
 */
const parseQuestionsResponse = async (rawContent, expectedCount) => {
  let questions = [];

  // Thử parse trực tiếp
  try {
    questions = JSON.parse(rawContent);
  } catch {
    // Thử extract JSON array từ markdown
    const arrayMatch = rawContent.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        questions = JSON.parse(arrayMatch[0]);
      } catch {
        // Thử cách khác: loại bỏ markdown code block
        const cleaned = rawContent
          .replace(/```json\n?/gi, "")
          .replace(/```\n?/gi, "")
          .trim();
        try {
          questions = JSON.parse(cleaned);
        } catch {
          throw new AppError("AI trả về định dạng không hợp lệ cho câu hỏi", 502);
        }
      }
    } else {
      throw new AppError("AI trả về định dạng không hợp lệ cho câu hỏi", 502);
    }
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new AppError("AI không trả về danh sách câu hỏi hợp lệ", 502);
  }

  const apiKey = process.env.API_KEY;

  // Chuẩn hóa từng câu hỏi
  const normalized = questions
    .slice(0, expectedCount)
    .map((q, idx) => {
      const normalizedQ = {
        question: String(q.question || "").trim(),
        option_a: String(q.option_a || q.optionA || "").trim(),
        option_b: String(q.option_b || q.optionB || "").trim(),
        option_c: String(q.option_c || q.optionC || "").trim(),
        option_d: String(q.option_d || q.optionD || "").trim(),
        correct_answer: String(q.correct_answer || q.correctAnswer || "A").toUpperCase().trim(),
        explain: String(q.explain || "").trim(),
      };

      // Đảm bảo correct_answer chỉ là A/B/C/D
      if (!["A", "B", "C", "D"].includes(normalizedQ.correct_answer)) {
        normalizedQ.correct_answer = "A";
      }

      return normalizedQ;
    })
    .filter((q) => q.question.length > 0 && q.option_a.length > 0 && q.option_b.length > 0);

  if (normalized.length === 0) {
    throw new AppError("AI không trả về câu hỏi hợp lệ", 502);
  }

  // Dịch explain sang tiếng Việt cho từng câu hỏi
  for (const q of normalized) {
    q.explain = await translateExplainToVietnamese(q.explain, apiKey);
  }

  return normalized;
};

/**
 * Sinh transcript bài luyện nghe bằng AI từ OpenRouter.
 * Trả về { transcript, viTranslation }
 * Transcript phải phù hợp để chuyển thành audio dưới 2 phút.
 *
 * @param {string} title - Tiêu đề bài luyện nghe
 * @param {string} topic - Chủ đề bài luyện nghe
 * @returns {Promise<{transcript: string, viTranslation: string}>}
 */
const generateListeningTranscriptByAI = async (title, topic) => {
  if (!topic || !topic.trim()) {
    throw new AppError("Vui lòng nhập chủ đề bài luyện nghe", 400);
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AppError("API_KEY chưa được cấu hình", 500);
  }

  const systemPrompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp, có khả năng viết bài luyện nghe cho người học.

YÊU CẦU:
- Viết một bài luyện nghe hoàn chỉnh BẰNG TIẾNG ANH theo chủ đề mà người dùng yêu cầu.
- Bài luyện nghe phải phù hợp để chuyển thành audio dưới 2 phút (khoảng 150-250 từ tiếng Anh).
- Ngữ pháp rõ ràng, câu ngắn gọn, dễ phát âm (phù hợp cho TTS đọc).
- KHÔNG có các từ khó phát âm hoặc ký hiệu đặc biệt phức tạp (ví dụ: /, \\, @, #, v.v.).
- Bài viết phải có cấu trúc tự nhiên, như một đoạn hội thoại hoặc bài thuyết trình ngắn.
- KHÔNG đánh số câu, KHÔNG in đậm, KHÔNG in nghiêng, chỉ viết văn bản thuần túy.
- KHÔNG trả lời bằng markdown code block, chỉ trả về văn bản thuần túy.

ĐỊNH DẠNG TRẢ VỀ:
Trả về JSON object với 2 trường:
{
  "transcript": "<bài luyện nghe bằng tiếng Anh, không có markdown>",
  "viTranslation": "<bản dịch tiếng Việt của bài luyện nghe trên>"
}

QUAN TRỌNG:
- Chỉ trả về JSON object thuần túy, không có markdown code block, không có giải thích gì thêm.
- Trường "transcript" chứa bài luyện nghe TIẾNG ANH (150-250 từ).
- Trường "viTranslation" chứa bản dịch TIẾNG VIỆT của bài luyện nghe đó.
- Bản dịch tiếng Việt phải sát nghĩa, rõ ràng, tự nhiên.
- Transcript phải dễ đọc cho TTS (không có emoji, ký hiệu lạ).`;

  const userPrompt = `Hãy viết một bài luyện nghe tiếng Anh theo chủ đề sau:

Tiêu đề: "${title.trim()}"
Chủ đề: "${topic.trim()}"

Yêu cầu:
- Khoảng 150-250 từ tiếng Anh.
- Viết tự nhiên như một đoạn hội thoại hoặc bài thuyết trình ngắn.
- Dễ phát âm cho TTS (ElevenLabs).
- Không có ký hiệu đặc biệt phức tạp.

Trả về đúng định dạng JSON với "transcript" (tiếng Anh) và "viTranslation" (tiếng Việt).`;

  const models = AI_MODELS;
  let lastError = null;

  for (const model of models) {
    try {
      const rawContent = await callOpenRouterRaw(apiKey, model, systemPrompt, userPrompt, 3000);
      return parseListeningTranscriptResponse(rawContent);
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

/**
 * Parse JSON response từ AI cho transcript luyện nghe.
 * @param {string} rawContent
 * @returns {{transcript: string, viTranslation: string}}
 */
const parseListeningTranscriptResponse = (rawContent) => {
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed.transcript && parsed.viTranslation) {
      return {
        transcript: parsed.transcript.trim(),
        viTranslation: parsed.viTranslation.trim(),
      };
    }
  } catch {
    // Thử extract JSON từ markdown
  }

  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.transcript && parsed.viTranslation) {
        return {
          transcript: parsed.transcript.trim(),
          viTranslation: parsed.viTranslation.trim(),
        };
      }
    } catch {
      // continue
    }
  }

  throw new AppError("AI trả về định dạng không hợp lệ cho bài luyện nghe", 502);
};

/**
 * Sinh câu hỏi nghe hiểu bằng AI từ OpenRouter.
 * Trả về mảng các câu hỏi với explain đã dịch tiếng Việt.
 *
 * @param {string} transcript - Nội dung bài luyện nghe tiếng Anh
 * @param {string} viTranslation - Bản dịch tiếng Việt của bài luyện nghe
 * @param {number} questionCount - Số câu hỏi muốn sinh (1-5)
 * @returns {Promise<Array>}
 */
const generateListeningQuestionsByAI = async (transcript, viTranslation, questionCount) => {
  if (!transcript || !transcript.trim()) {
    throw new AppError("Nội dung bài luyện nghe không hợp lệ", 400);
  }

  if (!viTranslation || !viTranslation.trim()) {
    throw new AppError("Bản dịch tiếng Việt không hợp lệ", 400);
  }

  const safeCount = Math.min(Math.max(1, parseInt(questionCount, 10) || 5), 5);

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AppError("API_KEY chưa được cấu hình", 500);
  }

  const systemPrompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp, có khả năng tạo câu hỏi nghe hiểu.

YÊU CẦU:
- Tạo đúng ${safeCount} câu hỏi trắc nghiệm (4 lựa chọn) dựa trên bài luyện nghe được cung cấp.
- Mỗi câu hỏi phải kiểm tra kỹ năng nghe hiểu: chi tiết, suy luận, từ vựng, hoặc ý chính.
- Các đáp án (A, B, C, D) phải có độ dài tương đương, không quá 200 ký tự mỗi đáp án.
- Đáp án đúng phải rõ ràng, không mơ hồ.

ĐỊNH DẠNG TRẢ VỀ:
Trả về JSON array các câu hỏi, mỗi câu hỏi có format:
{
  "question": "<câu hỏi bằng tiếng Anh>",
  "option_a": "<đáp án A tiếng Anh>",
  "option_b": "<đáp án B tiếng Anh>",
  "option_c": "<đáp án C tiếng Anh>",
  "option_d": "<đáp án D tiếng Anh>",
  "correct_answer": "<A hoặc B hoặc C hoặc D>",
  "explain": "<giải thích bằng TIẾNG VIỆT: dịch câu hỏi + các đáp án ra tiếng Việt, chỉ rõ đáp án đúng, giải thích ngắn gọn tại sao đúng/sai>"
}

QUAN TRỌNG:
- Chỉ trả về JSON array thuần túy, không có markdown code block, không có giải thích gì thêm.
- Trường "question" và các option phải bằng TIẾNG ANH.
- Trường "explain" phải bằng TIẾNG VIỆT, có format: [Dịch câu hỏi và đáp án] → Đáp án đúng: [giải thích]
- Ví dụ explain: "Câu hỏi: 'dịch câu hỏi ra tiếng việt' | A: 'dịch đáp án ra tiếng việt' | B: 'dịch đáp án ra tiếng việt' | C: 'dịch đáp án ra tiếng việt' | D: 'dịch đáp án ra tiếng việt' → Đáp án đúng: C. Giải thích: Người nói chủ yếu nói về giáo dục vì..."
- Đáp án đúng phải nằm trong phần giải thích.`;

  const userPrompt = `Dựa trên bài luyện nghe sau, hãy tạo ${safeCount} câu hỏi trắc nghiệm:

=== BÀI LUYỆN NGHE TIẾNG ANH ===
${transcript.trim()}
=== HẾT BÀI LUYỆN NGHE ===

=== BẢN DỊCH TIẾNG VIỆT ===
${viTranslation.trim()}
=== HẾT BẢN DỊCH ===

Tạo đúng ${safeCount} câu hỏi theo định dạng JSON array đã mô tả.`;

  const models = AI_MODELS;
  let lastError = null;

  for (const model of models) {
    try {
      const rawContent = await callOpenRouterRaw(apiKey, model, systemPrompt, userPrompt, 3000);
      return await parseListeningQuestionsResponse(rawContent, safeCount);
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

/**
 * Parse JSON response từ AI cho câu hỏi nghe hiểu.
 * Tự động dịch trường explain sang tiếng Việt nếu chưa phải.
 * @param {string} rawContent
 * @param {number} expectedCount
 * @returns {Promise<Array>}
 */
const parseListeningQuestionsResponse = async (rawContent, expectedCount) => {
  let questions = [];

  try {
    questions = JSON.parse(rawContent);
  } catch {
    const arrayMatch = rawContent.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        questions = JSON.parse(arrayMatch[0]);
      } catch {
        const cleaned = rawContent
          .replace(/```json\n?/gi, "")
          .replace(/```\n?/gi, "")
          .trim();
        try {
          questions = JSON.parse(cleaned);
        } catch {
          throw new AppError("AI trả về định dạng không hợp lệ cho câu hỏi nghe", 502);
        }
      }
    } else {
      throw new AppError("AI trả về định dạng không hợp lệ cho câu hỏi nghe", 502);
    }
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new AppError("AI không trả về danh sách câu hỏi hợp lệ", 502);
  }

  const apiKey = process.env.API_KEY;

  const normalized = questions
    .slice(0, expectedCount)
    .map((q) => {
      const normalizedQ = {
        question: String(q.question || "").trim(),
        option_a: String(q.option_a || q.optionA || "").trim(),
        option_b: String(q.option_b || q.optionB || "").trim(),
        option_c: String(q.option_c || q.optionC || "").trim(),
        option_d: String(q.option_d || q.optionD || "").trim(),
        correct_answer: String(q.correct_answer || q.correctAnswer || "A").toUpperCase().trim(),
        explain: String(q.explain || "").trim(),
      };

      if (!["A", "B", "C", "D"].includes(normalizedQ.correct_answer)) {
        normalizedQ.correct_answer = "A";
      }

      return normalizedQ;
    })
    .filter((q) => q.question.length > 0 && q.option_a.length > 0 && q.option_b.length > 0);

  if (normalized.length === 0) {
    throw new AppError("AI không trả về câu hỏi hợp lệ", 502);
  }

  // Dịch explain sang tiếng Việt cho từng câu hỏi
  for (const q of normalized) {
    q.explain = await translateExplainToVietnamese(q.explain, apiKey);
  }

  return normalized;
};

/**
 * Chuyển transcript thành audio bằng ElevenLabs TTS API.
 * @param {string} transcript - Nội dung cần chuyển thành audio
 * @returns {Promise<Buffer>} - Dữ liệu audio dạng Buffer
 */
const generateAudioByElevenLabs = async (transcript) => {
  if (!transcript || !transcript.trim()) {
    throw new AppError("Transcript không hợp lệ để chuyển thành audio", 400);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new AppError("ELEVENLABS_API_KEY chưa được cấu hình", 500);
  }

  const voiceId = "EXAVITQu4vr4xnSDxMaL";

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": `${apiKey}`,
    },
    body: JSON.stringify({
      text: transcript.trim(),
      model_id: "eleven_multilingual_v2",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("ElevenLabs TTS error:", response.status, errorBody);
    throw new AppError(`Lỗi ElevenLabs TTS (${response.status}): Vui lòng thử lại sau`, 502);
  }

  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer);
};

module.exports = {
  generateVocabularyByAI,
  generateReadingLessonByAI,
  generateReadingQuestionsByAI,
  generateListeningTranscriptByAI,
  generateListeningQuestionsByAI,
  generateAudioByElevenLabs,
  DEFAULT_WORD_COUNT,
  AI_MODELS,
};
