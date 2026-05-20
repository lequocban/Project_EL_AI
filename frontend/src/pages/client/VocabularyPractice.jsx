import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlashcardGame from "@/components/client/vocabulary/FlashcardGame";
import MatchGame from "@/components/client/vocabulary/MatchGame";
import MultipleChoiceGame from "@/components/client/vocabulary/MultipleChoiceGame";
import TypingGame from "@/components/client/vocabulary/TypingGame";
import DictationGame from "@/components/client/vocabulary/DictationGame";
import ExamGame from "@/components/client/vocabulary/ExamGame";
import { vocabularyApi } from "@/api/client/vocabularyApi";

const VALID_MODES = ["flashcard", "match", "quiz", "typing", "dictation"];
const EXAM_TYPES = ["quiz", "listening_quiz", "translate_write", "listening_write"];

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function VocabularyPractice() {
  const { id, mode } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isExamMode = mode.startsWith("exam-");
  const examType = isExamMode ? mode.replace("exam-", "") : null;

  useEffect(() => {
    if (!VALID_MODES.includes(mode) && !isExamMode) {
      setError("Chế độ luyện tập không hợp lệ");
      setLoading(false);
      return;
    }

    if (isExamMode && !EXAM_TYPES.includes(examType)) {
      setError("Loại bài kiểm tra không hợp lệ");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await vocabularyApi.getSetById(id, { page: 1, limit: 500 });
        setSet(data);
        setWords(data.words || []);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu luyện tập");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, mode, isExamMode, examType]);

  const handlePracticeSubmit = async ({ setId, type, answers, timeSpent }) => {
    return vocabularyApi.submitPractice({ setId, type, answers, timeSpent });
  };

  const handleBack = () => {
    navigate(`/vocabulary/${id}`);
  };

  if (loading) return <LoadingScreen />;

  if (error || !set) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || "Không tìm thấy dữ liệu"}</p>
          <button
            onClick={handleBack}
            className="gradient-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (mode === "flashcard") {
    return <FlashcardGame words={words} set={set} onBack={handleBack} />;
  }
  if (mode === "match") {
    return <MatchGame words={words} set={set} onBack={handleBack} />;
  }
  if (mode === "quiz") {
    return <MultipleChoiceGame words={words} set={set} onBack={handleBack} />;
  }
  if (mode === "typing") {
    return <TypingGame words={words} onBack={handleBack} />;
  }
  if (mode === "dictation") {
    return <DictationGame words={words} onBack={handleBack} />;
  }
  if (isExamMode) {
    return (
      <ExamGame
        words={words}
        onBack={handleBack}
        examType={examType}
        setId={set.id}
        onSubmit={handlePracticeSubmit}
      />
    );
  }

  return null;
}
