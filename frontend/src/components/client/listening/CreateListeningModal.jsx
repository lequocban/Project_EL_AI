import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { listeningApi } from "@/api/client/listeningApi";

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Cơ bản" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
];

export default function CreateListeningModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tên bài nghe");
      return;
    }
    if (!topic.trim()) {
      setError("Vui lòng nhập chủ đề bài nghe");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const lesson = await listeningApi.generateWithAI({
        title: title.trim(),
        topic: topic.trim(),
        level,
        questionCount,
      });
      onCreated(lesson);
    } catch (err) {
      setError(err.message || "Không thể tạo bài nghe bằng AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-black">Tạo bài nghe bằng AI</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">
              Tên bài nghe <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Giao tiếp trong nhà hàng"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">
              Chủ đề muốn học <span className="text-red-500">*</span>
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Ordering food at a restaurant, Asking for directions..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Nhập chủ đề bằng tiếng Anh để AI tạo bài phù hợp
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">
              Trình độ
            </label>
            <div className="flex gap-2">
              {LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLevel(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    level === opt.value
                      ? "bg-green-500 text-white shadow-md"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">
              Số câu hỏi
            </label>
            <div className="flex gap-2">
              {[3, 5, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    questionCount === count
                      ? "bg-green-500 text-white shadow-md"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {count} câu
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tạo bằng AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
