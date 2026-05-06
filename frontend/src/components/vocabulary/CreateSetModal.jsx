import { useState } from "react";
import base44 from "@/api/base44Client";
import { X, Sparkles, Keyboard } from "lucide-react";

export default function CreateSetModal({ onClose, onCreated }) {
  const [mode, setMode] = useState("manual"); // manual | ai
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("beginner");
  const [topic, setTopic] = useState("general");
  const [isPublic, setIsPublic] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkAILimit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const u = await base44.auth.me();
    const logs = await base44.entities.AIUsageLog.filter({
      created_by: u.email,
      feature: "vocabulary",
      usage_date: today,
    });
    const total = logs.reduce((s, l) => s + (l.count || 0), 0);
    return total < 5;
  };

  const createManual = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tên bộ từ vựng");
      return;
    }
    setLoading(true);
    const set = await base44.entities.VocabularySet.create({
      title,
      description,
      level,
      topic,
      is_public: isPublic,
      word_count: 0,
    });
    onCreated(set);
  };

  const createWithAI = async () => {
    if (!aiPrompt.trim()) {
      setError("Vui lòng nhập chủ đề");
      return;
    }
    const canUse = await checkAILimit();
    if (!canUse) {
      setError("Bạn đã dùng hết 5 lượt tạo AI hôm nay. Thử lại vào ngày mai!");
      return;
    }
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tạo bộ từ vựng tiếng Anh về chủ đề: "${aiPrompt}". Trả về JSON với: title (tên bộ từ tiếng Việt), description (mô tả ngắn), level (beginner/intermediate/advanced), words là mảng 15-20 từ, mỗi từ có: word, meaning (nghĩa tiếng Việt), pronunciation (phiên âm IPA), example (câu ví dụ), part_of_speech.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          level: { type: "string" },
          words: {
            type: "array",
            items: {
              type: "object",
              properties: {
                word: { type: "string" },
                meaning: { type: "string" },
                pronunciation: { type: "string" },
                example: { type: "string" },
                part_of_speech: { type: "string" },
              },
            },
          },
        },
      },
    });
    const set = await base44.entities.VocabularySet.create({
      title: result.title || aiPrompt,
      description: result.description || "",
      level: result.level || "intermediate",
      topic: "custom",
      is_public: false,
      word_count: result.words?.length || 0,
      is_ai_generated: true,
    });
    if (result.words?.length) {
      await base44.entities.VocabularyWord.bulkCreate(
        result.words.map((w) => ({ ...w, set_id: set.id })),
      );
    }
    const today = new Date().toISOString().split("T")[0];
    const u = await base44.auth.me();
    const logs = await base44.entities.AIUsageLog.filter({
      created_by: u.email,
      feature: "vocabulary",
      usage_date: today,
    });
    if (logs[0]) {
      await base44.entities.AIUsageLog.update(logs[0].id, {
        count: (logs[0].count || 0) + 1,
      });
    } else {
      await base44.entities.AIUsageLog.create({
        feature: "vocabulary",
        usage_date: today,
        count: 1,
      });
    }
    onCreated(set);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-black">Tạo bộ từ vựng mới</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Mode Switch */}
          <div className="flex gap-2 mb-5">
            {[
              ["manual", <Keyboard className="w-4 h-4" />, "Thủ công"],
              ["ai", <Sparkles className="w-4 h-4" />, "Tạo bằng AI"],
            ].map(([val, icon, label]) => (
              <button
                key={val}
                onClick={() => setMode(val)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  mode === val
                    ? "gradient-primary text-white shadow-md"
                    : "border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {mode === "manual" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">
                  Tên bộ từ *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Từ vựng về thể thao"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Mô tả ngắn..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">
                    Trình độ
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none"
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">
                    Chủ đề
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none"
                  >
                    <option value="general">Tổng quát</option>
                    <option value="business">Kinh doanh</option>
                    <option value="travel">Du lịch</option>
                    <option value="academic">Học thuật</option>
                    <option value="toeic">TOEIC</option>
                    <option value="custom">Tùy chỉnh</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-foreground">
                  Công khai cho cộng đồng
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-violet-50 rounded-xl p-3 text-xs text-violet-700 font-medium">
                ✨ AI sẽ tự động tạo 15-20 từ vựng về chủ đề bạn nhập. Giới hạn
                5 lần/ngày.
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">
                  Chủ đề muốn học *
                </label>
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="VD: Từ vựng về công nghệ, thể thao, ẩm thực..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm font-medium mt-3">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={mode === "manual" ? createManual : createWithAI}
              disabled={loading}
              className="flex-1 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Đang tạo...
                </>
              ) : mode === "ai" ? (
                "✨ Tạo bằng AI"
              ) : (
                "Tạo bộ từ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
