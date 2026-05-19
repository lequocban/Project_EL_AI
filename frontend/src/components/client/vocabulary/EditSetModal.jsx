import { useState } from "react";
import { X, PencilLine } from "lucide-react";
import { vocabularyApi } from "@/api/client/vocabularyApi";

// Component modal chỉnh sửa thông tin bộ từ vựng
export default function EditSetModal({ set, onClose, onUpdated }) {
  const [title, setTitle] = useState(set.title || "");
  const [description, setDescription] = useState(set.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lưu thay đổi thông tin bộ từ vựng lên backend
  const handleSave = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tên bộ từ vựng");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const updated = await vocabularyApi.updateSet(set.id, {
        title: title.trim(),
        description: description.trim(),
      });
      // Đảm bảo truyền đầy đủ dữ liệu, giữ nguyên id và các field khác của set gốc
      onUpdated({ ...set, ...updated });
      onClose();
    } catch (err) {
      setError(err.message || "Không thể cập nhật bộ từ vựng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-black flex items-center gap-2">
            <PencilLine className="w-5 h-5 text-primary" />
            Chỉnh sửa bộ từ vựng
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
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
              rows={3}
              placeholder="Mô tả ngắn..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
