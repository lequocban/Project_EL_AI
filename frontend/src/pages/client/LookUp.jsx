import { useState } from "react";
import { Search, Volume2, BookText } from "lucide-react";
import { API_BASE_URL } from "@/api/authApi";

export default function LookUp() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("englishup_access_token");
      const res = await fetch(`${API_BASE_URL}/api/v1/vocabulary/lookup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ word: word.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không tìm thấy từ này trong từ điển.");
      } else {
        setResult(data.data);
      }
    } catch {
      setError("Có lỗi xảy ra khi tra cứu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (result?.audioUrl) {
      const audio = new Audio(result.audioUrl);
      audio.play().catch(() => {
        setError("Không thể phát âm thanh.");
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground">Tra cứu từ vựng</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Nhập từ tiếng Anh để tra nghĩa tiếng Việt
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleLookup} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Nhập từ cần tra..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white text-foreground font-semibold text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !word.trim()}
              className="gradient-primary text-white font-extrabold text-base px-7 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang tra...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Tra cứu
                </>
              )}
            </button>
          </div>
        </form>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Kết quả tra cứu */}
        {result && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Phần header - màu gradient giống nút ngữ pháp (from-blue-500 to-cyan-500) */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-white">{result.word}</h2>
                    {result.phonetic && (
                      <p className="text-white/80 text-base font-semibold mt-1">{result.phonetic}</p>
                    )}
                  </div>
                  {result.audioUrl && (
                    <button
                      onClick={playAudio}
                      className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors mt-1"
                      title="Phát âm"
                    >
                      <Volume2 className="w-6 h-6 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Phần nội dung */}
              <div className="p-6">
                {/* Nghĩa */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                      Nghĩa tiếng Việt
                    </span>
                  </div>
                  <p className="text-xl font-extrabold text-foreground leading-snug">
                    {result.meaning}
                  </p>
                </div>

                {/* Đường kẻ phân cách */}
                <div className="border-t border-border" />
              </div>
            </div>

            {/* Gợi ý */}
            <p className="text-xs text-muted-foreground/70 font-medium mt-3 text-center">
              Kết quả được lấy từ từ điển Tiếng Anh - Tiếng Việt
            </p>
          </div>
        )}

        {/* Trạng thái ban đầu - chưa tra cứu */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <BookText className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-extrabold text-foreground text-lg mb-2">Từ điển Anh - Việt</h3>
            <p className="text-muted-foreground text-sm font-medium">
              Nhập từ tiếng Anh bất kỳ vào ô tìm kiếm phía trên để tra nghĩa tiếng Việt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
