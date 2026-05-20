import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LessonStarter } from "./Listening";
import { listeningApi } from "@/api/client/listeningApi";

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ListeningDetail() {
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
        const data = await listeningApi.getLessonById(id);
        setLesson(data);
      } catch (err) {
        setError(err.message || "Không thể tải bài luyện nghe");
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
          <p className="text-red-600 font-semibold mb-4">{error || "Không tìm thấy bài luyện nghe"}</p>
          <button
            onClick={() => navigate("/listening")}
            className="gradient-green text-white px-6 py-2.5 rounded-xl font-bold text-sm"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <LessonStarter
      lesson={lesson}
      onBack={() => navigate("/listening")}
    />
  );
}
