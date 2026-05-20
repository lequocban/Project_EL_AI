import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReadingStarter } from "./Reading";
import { readingApi } from "@/api/client/readingApi";

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ReadingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await readingApi.getLessonById(id);
        setLesson(data);
      } catch (err) {
        setError(err.message || "Không thể tải bài luyện đọc");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || "Không tìm thấy bài luyện đọc"}</p>
          <button
            onClick={() => navigate("/reading")}
            className="gradient-orange text-white px-6 py-2.5 rounded-xl font-bold text-sm"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReadingStarter
      lesson={lesson}
      onBack={() => navigate("/reading")}
    />
  );
}
