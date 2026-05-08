import { useState } from "react";
import { X, Sparkles, Keyboard } from "lucide-react";
import { vocabularyApi } from "@/api/vocabularyApi";

export default function CreateSetModal({ onClose, onCreated }) {
  const [mode, setMode] = useState("manual");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createManual = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tên bộ từ vựng");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const set = await vocabularyApi.createSet({
        title: title.trim(),
        description: description.trim(),
      });
      onCreated(set);
    } catch (err) {
      setError(err.message || "Không thể tạo bộ từ vựng");
    } finally {
      setLoading(false);
    }
  };

  const createWithAI = async () => {
    if (!aiPrompt.trim()) {
      setError("Vui lòng nhập chủ đề từ vựng");
      return;
    }
    if (!title.trim()) {
      setError("Vui lòng nhập tên bộ từ vựng");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const set = await vocabularyApi.generateWordsWithAI({
        title: title.trim(),
        description: aiDescription.trim() || undefined,
        topic: aiPrompt.trim(),
        wordCount: 10,
      });
      onCreated(set);
    } catch (err) {
      setError(err.message || "Không thể tạo bộ từ vựng bằng AI");
    } finally {
      setLoading(false);
    }
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
          <div className="flex gap-2 mb-5">
            {[
              ["manual", <Keyboard className="w-4 h-4" />, "Thủ công"],
              ["ai", <Sparkles className="w-4 h-4" />, "Tạo bằng AI"],
            ].map(([val, icon, label]) => (
              <button
                key={val}
                onClick={() => {
                  setMode(val);
                  setError("");
                }}
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
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">
                  Tên bộ từ vựng *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Từ vựng về công nghệ"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">
                  Chủ đề muốn học *
                </label>
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="VD: công nghệ AI, thể thao, ẩm thực Việt Nam..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">
                  Mô tả ngắn
                </label>
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  rows={2}
                  placeholder="Mô tả ngắn về chủ đề (không bắt buộc)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
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
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
