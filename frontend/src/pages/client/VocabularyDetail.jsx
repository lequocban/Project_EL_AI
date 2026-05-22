import { useState, useEffect, useCallback } from "react";
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
  const [favorites, setFavorites] = useState([]);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [moderationStatus, setModerationStatus] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await vocabularyApi.getFavorites({ limit: 100 });
        setFavorites(data?.items || []);
      } catch (err) {
        console.error("Không thể tải danh sách yêu thích:", err);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = useCallback(async (setId) => {
    if (isTogglingFavorite) return;
    const isFav = favorites.some((f) => String(f.id) === String(setId));
    const prevFavorites = [...favorites];

    try {
      setIsTogglingFavorite(true);
      if (isFav) {
        setFavorites((prev) => prev.filter((f) => String(f.id) !== String(setId)));
        await vocabularyApi.removeFavorite(setId);
      } else {
        if (set) {
          setFavorites((prev) => [...prev, set]);
        }
        await vocabularyApi.addFavorite(setId);
      }
    } catch (err) {
      setFavorites(prevFavorites);
      console.error("Không thể cập nhật yêu thích:", err);
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [favorites, isTogglingFavorite, set]);

  useEffect(() => {
    const fetchSet = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await vocabularyApi.getSetById(id);
        setSet(data);

        // Fetch moderation requests để lấy trạng thái kiểm duyệt mới nhất
        try {
          const modData = await vocabularyApi.getMyModerationRequests({ limit: 50 });
          // Tìm request liên quan đến bộ từ vựng này
          const relatedRequest = modData.items.find(
            (req) => String(req.contentId) === String(id)
          );
          if (relatedRequest) {
            setModerationStatus(relatedRequest.status);
          }
        } catch (err) {
          console.error("Không thể tải trạng thái kiểm duyệt:", err);
        }
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
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      moderationStatus={moderationStatus}
      onModerationStatusChange={setModerationStatus}
    />
  );
}
