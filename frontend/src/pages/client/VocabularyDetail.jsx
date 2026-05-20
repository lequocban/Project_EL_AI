import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SetDetail from "@/components/client/vocabulary/SetDetail";
import { vocabularyApi } from "@/api/client/vocabularyApi";

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function VocabularyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSet = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await vocabularyApi.getSetById(id);
        setSet(data);
      } catch (err) {
        setError(err.message || "Không thể tải bộ từ vựng");
      } finally {
        setLoading(false);
      }
    };
    fetchSet();
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (error || !set) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || "Không tìm thấy bộ từ vựng"}</p>
          <button
            onClick={() => navigate("/vocabulary")}
            className="gradient-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const normalizedSet = {
    ...set,
    wordCount: set.wordCount ?? set.word_count ?? 0,
    status: set.status ?? "private",
    is_public: set.status === "public",
    is_pending: set.status === "req_public",
  };

  return (
    <SetDetail
      set={normalizedSet}
      onBack={() => navigate("/vocabulary")}
      favorites={[]}
      onToggleFavorite={null}
    />
  );
}
