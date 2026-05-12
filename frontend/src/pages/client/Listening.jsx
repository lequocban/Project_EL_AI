import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Volume2,
  Play,
  Sparkles,
  Plus,
  X,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Loader2,
  FileText,
  Wand2,
  Clock,
} from "lucide-react";
import { listeningApi } from "@/api/listeningApi";
import PracticeHistoryModal from "@/components/client/practice/PracticeHistoryModal";

const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};
const LEVEL_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

export default function Listening() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("mine");
  const [search, setSearch] = useState("");
  const [startLesson, setStartLesson] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadDataRef = useRef(null);

  const filteredLessons = search.trim()
    ? lessons.filter((l) =>
        l.title?.toLowerCase().includes(search.toLowerCase().trim())
      )
    : lessons;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data =
        tab === "mine"
          ? await listeningApi.getMyLessons({ search })
          : await listeningApi.getPublicLessons({ search });
      setLessons(data.items || []);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu luyện nghe");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  loadDataRef.current = loadData;

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDataRef.current?.();
    }, 300);
    return () => clearTimeout(timer);
  }, [tab, search]);

  const handleCreated = async (lesson) => {
    await loadData();
    try {
      const detail = await listeningApi.getLessonById(lesson.id);
      setStartLesson(detail);
    } catch {
      // Neu khong lay duoc chi tiet, van reload danh sach binh thuong
    }
  };

  if (startLesson) {
    return (
      <LessonStarter
        lesson={startLesson}
        onBack={() => {
          setStartLesson(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">🎧 Luyện nghe</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cải thiện kỹ năng nghe tiếng Anh
          </p>
        </div>
        {tab === "mine" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-green-100 transition-all"
            >
              <Clock className="w-4 h-4" />
              Lịch sử
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 gradient-green text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tạo bài nghe
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          ["mine", "Của tôi"],
          ["public", "Cộng đồng"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              tab === val
                ? "gradient-green text-white shadow-md"
                : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm bài luyện nghe theo tiêu đề..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-border animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold">
            {search ? "Không tìm thấy bài luyện nghe nào phù hợp" : "Chưa có bài luyện nghe nào"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={async () => {
                setDetailLoading(true);
                try {
                  const detail = await listeningApi.getLessonById(lesson.id);
                  setStartLesson(detail);
                } catch (err) {
                  setError(err.message || "Không thể tải chi tiết bài luyện nghe");
                } finally {
                  setDetailLoading(false);
                }
              }}
              className="bg-white rounded-2xl p-5 border border-border card-hover cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {lesson.level && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          LEVEL_COLORS[lesson.level] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {LEVEL_LABELS[lesson.level] || lesson.level}
                      </span>
                    )}
                    {tab === "mine" ? (
                      lesson.is_public ? (
                        <Globe
                          className="w-3.5 h-3.5 text-blue-400"
                          title="Công khai"
                        />
                      ) : (
                        <Lock
                          className="w-3.5 h-3.5 text-muted-foreground/50"
                          title="Riêng tư"
                        />
                      )
                    ) : (
                      <Globe
                        className="w-3.5 h-3.5 text-blue-400"
                        title="Cộng đồng"
                      />
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreateModal && (
        <CreateListeningModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
      {showHistory && (
        <PracticeHistoryModal
          type="listening"
          onClose={() => setShowHistory(false)}
          getHistory={listeningApi.getPracticeHistory}
          getDetail={listeningApi.getPracticeDetail}
        />
      )}
    </div>
  );
}

// Modal tạo bài luyện nghe
function CreateListeningModal({ onClose, onCreated }) {
  const [mode, setMode] = useState("manual"); // "manual" | "ai"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form thủ công
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [transcriptVi, setTranscriptVi] = useState("");

  // Form AI
  const [aiTitle, setAiTitle] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(3);

  const handleManualSubmit = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài luyện nghe");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const lesson = await listeningApi.createLesson({
        title: title.trim(),
        audioUrl: audioUrl.trim() || undefined,
        transcript: transcript.trim() || undefined,
        viTranslation: transcriptVi.trim() || undefined,
      });
      onCreated(lesson);
      onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo bài luyện nghe");
    } finally {
      setLoading(false);
    }
  };

  const handleAISubmit = async () => {
    if (!aiTitle.trim()) {
      setError("Vui lòng nhập tiêu đề bài luyện nghe");
      return;
    }
    if (!aiTopic.trim()) {
      setError("Vui lòng nhập chủ đề bài luyện nghe");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const lesson = await listeningApi.generateWithAI({
        title: aiTitle.trim(),
        topic: aiTopic.trim(),
        questionCount: aiQuestionCount,
      });
      onCreated(lesson);
      onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo bài luyện nghe bằng AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-foreground">Tạo bài luyện nghe</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Chế độ tạo */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode("manual"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mode === "manual"
                ? "gradient-green text-white shadow-md"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <FileText className="w-4 h-4" />
            Tạo thủ công
          </button>
          <button
            onClick={() => { setMode("ai"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mode === "ai"
                ? "gradient-green text-white shadow-md"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Tạo bằng AI
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {mode === "manual" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Nhập tiêu đề bài luyện nghe..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Link audio (tùy chọn)
              </label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nội dung bài nghe - Tiếng Anh (tùy chọn)
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={4}
                placeholder="Nhập nội dung bài nghe tiếng Anh..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nội dung bài nghe - Tiếng Việt (tùy chọn)
              </label>
              <textarea
                value={transcriptVi}
                onChange={(e) => setTranscriptVi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={4}
                placeholder="Nhập bản dịch tiếng Việt..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="VD: Daily Conversation at Restaurant"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Chủ đề <span className="text-red-500">*</span>
              </label>
              <textarea
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={3}
                placeholder="VD: A conversation between a customer and a waiter at a restaurant, ordering food and drinks"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Số câu hỏi (3 - 5) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={3}
                  max={5}
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-lg font-black text-primary w-8 text-center">
                  {aiQuestionCount}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AI sẽ tạo từ 3 đến 5 câu hỏi cho bài luyện nghe
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-border py-2.5 rounded-xl font-bold text-sm hover:bg-muted transition-all"
          >
            Hủy
          </button>
          <button
            onClick={mode === "manual" ? handleManualSubmit : handleAISubmit}
            disabled={loading}
            className="flex-1 gradient-green text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tạo...
              </>
            ) : mode === "manual" ? (
              <>
                <Save className="w-4 h-4" />
                Tạo bài
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Tạo bằng AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Giao diện bắt đầu làm bài (có nút chỉnh sửa)
function LessonStarter({ lesson, onBack }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState(lesson.questions || []);
  const [transcriptEn, setTranscriptEn] = useState(lesson.transcript || lesson.audio_script || "");
  const [transcriptVi, setTranscriptVi] = useState(lesson.vi_translation || "");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  // Các câu hỏi gốc từ server (dùng để phát hiện thay đổi)
  const originalQuestionsRef = useRef(lesson.questions || []);

  const handleStart = () => {
    navigate(`/listening/${lesson.id}/practice`, {
      state: { lesson: { ...lesson, questions, transcript: transcriptEn, vi_translation: transcriptVi } }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      // Lưu transcript và vi_translation trước
      await listeningApi.updateLesson(lesson.id, {
        transcript: transcriptEn,
        viTranslation: transcriptVi,
      });

      // 1. Xóa các câu hỏi đã được xóa khỏi giao diện
      if (deletedQuestionIds.length > 0) {
        await Promise.all(
          deletedQuestionIds.map((id) => listeningApi.deleteQuestion(id))
        );
      }

      // 2. Cập nhật các câu hỏi đã sửa (có id từ server và đã bị thay đổi)
      const originalMap = new Map(
        originalQuestionsRef.current.map((q) => [q.id, q])
      );
      const modifiedQuestions = questions.filter((q) => {
        if (!q.id || String(q.id).startsWith("temp_")) return false;
        const original = originalMap.get(q.id);
        if (!original) return false;
        return (
          original.question !== q.question ||
          JSON.stringify(original.options) !== JSON.stringify(q.options) ||
          original.correct_answer !== q.correct_answer ||
          (original.explain || "") !== (q.explain || "")
        );
      });
      if (modifiedQuestions.length > 0) {
        await Promise.all(
          modifiedQuestions.map((q) =>
            listeningApi.updateQuestion(q.id, {
              question: q.question,
              option_a: q.options[0],
              option_b: q.options[1],
              option_c: q.options[2],
              option_d: q.options[3],
              correct_answer: q.correct_answer,
              explain: q.explain,
            })
          )
        );
      }

      // 3. Tạo các câu hỏi mới (chưa có id từ server)
      const newQuestions = questions.filter(
        (q) => !q.id || String(q.id).startsWith("temp_")
      );
      if (newQuestions.length > 0) {
        const savedQuestions = await listeningApi.createBulkQuestions(
          lesson.id,
          newQuestions.map((q) => ({
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
            explain: q.explain,
          }))
        );

        // Thay thế các câu hỏi tạm bằng câu hỏi đã có id từ server
        const tempIds = newQuestions.map((q) => q.id);
        const updatedQuestions = questions.map((q) => {
          const tempIndex = tempIds.indexOf(q.id);
          if (tempIndex !== -1 && savedQuestions[tempIndex]) {
            return { ...q, id: savedQuestions[tempIndex].id };
          }
          return q;
        });
        setQuestions(updatedQuestions);
        originalQuestionsRef.current = updatedQuestions;
      } else {
        originalQuestionsRef.current = questions;
      }

      setDeletedQuestionIds([]);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion({
      id: null,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: null,
      explanation: "",
    });
    setShowAddQuestion(true);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion({
      ...q,
      correctAnswer: ["A", "B", "C", "D"].indexOf(q.correct_answer),
    });
    setShowAddQuestion(true);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion.question.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    if (editingQuestion.options.some((o) => !o.trim())) {
      alert("Vui lòng nhập đầy đủ 4 đáp án");
      return;
    }
    if (editingQuestion.correctAnswer === null) {
      alert("Vui lòng chọn đáp án đúng");
      return;
    }

    const correctLetter = ["A", "B", "C", "D"][editingQuestion.correctAnswer];
    const newQuestion = {
      id: editingQuestion.id || `temp_${Date.now()}`,
      question: editingQuestion.question,
      options: editingQuestion.options,
      correct_answer: correctLetter,
      explain: editingQuestion.explanation,
    };

    let updatedQuestions;
    if (editingQuestion.id) {
      updatedQuestions = questions.map((q) =>
        q.id === editingQuestion.id ? newQuestion : q
      );
    } else {
      updatedQuestions = [...questions, newQuestion];
    }

    setQuestions(updatedQuestions);
    setShowAddQuestion(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id) => {
    // Nếu là câu hỏi từ server (có id thật) thì đánh dấu đã xóa
    if (id && !String(id).startsWith("temp_")) {
      setDeletedQuestionIds((prev) => [...prev, id]);
    }
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                LEVEL_COLORS[lesson.level] || "bg-gray-100 text-gray-700"
              }`}
            >
              {LEVEL_LABELS[lesson.level] || lesson.level}
            </span>
            {!isEditing && !lesson.is_public && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            )}
          </div>

          <h1 className="text-2xl font-black text-foreground mb-2">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {lesson.description}
            </p>
          )}

          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-4 text-white mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">Bài luyện nghe</p>
                <p className="text-green-100 text-sm">
                  {questions.length} câu hỏi
                </p>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <button
            onClick={handleStart}
            className="w-full gradient-green text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Bắt đầu làm bài
          </button>
        </div>

        {/* Phần chỉnh sửa đoạn văn - chỉ hiện khi đang chỉnh sửa */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <h3 className="font-black text-foreground mb-4">Nội dung bài nghe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Đoạn văn tiếng Anh
                </label>
                <textarea
                  value={transcriptEn}
                  onChange={(e) => setTranscriptEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={5}
                  placeholder="Nhập đoạn văn tiếng Anh..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Đoạn văn tiếng Việt
                </label>
                <textarea
                  value={transcriptVi}
                  onChange={(e) => setTranscriptVi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={5}
                  placeholder="Nhập đoạn văn tiếng Việt..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Danh sách câu hỏi - chỉ hiện khi đang chỉnh sửa */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-foreground">
                Danh sách câu hỏi ({questions.length})
              </h3>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm câu hỏi
              </button>
            </div>

            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có câu hỏi nào
              </p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">
                          Câu {idx + 1}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {q.question}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {q.options?.map((opt, oi) => (
                            <span
                              key={oi}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                ["A", "B", "C", "D"][oi] === q.correct_answer
                                  ? "bg-green-100 text-green-700 font-semibold"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {["A", "B", "C", "D"][oi]}. {opt}
                            </span>
                          ))}
                        </div>
                        {q.explain && (
                          <p className="text-xs text-blue-600 mt-2">
                            <strong>Giải thích:</strong> {q.explain}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Sửa"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nút Hủy / Lưu khi đang chỉnh sửa */}
        {isEditing && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setQuestions(lesson.questions || []);
                setTranscriptEn(lesson.transcript || lesson.audio_script || "");
                setTranscriptVi(lesson.vi_translation || "");
                setDeletedQuestionIds([]);
                originalQuestionsRef.current = lesson.questions || [];
              }}
              disabled={saving}
              className="flex-1 border border-border py-3 rounded-xl font-bold text-sm hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 gradient-green text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa câu hỏi */}
      {showAddQuestion && editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-foreground">
                {editingQuestion.id ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
              </h2>
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setEditingQuestion(null);
                }}
                className="p-1.5 hover:bg-muted rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nội dung câu hỏi
                </label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={3}
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Các đáp án
                </label>
                <div className="space-y-2">
                  {["A", "B", "C", "D"].map((letter, idx) => (
                    <div key={letter} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingQuestion.correctAnswer === idx}
                        onChange={() =>
                          setEditingQuestion({
                            ...editingQuestion,
                            correctAnswer: idx,
                          })
                        }
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-xs font-bold text-muted-foreground w-5">
                        {letter}.
                      </span>
                      <input
                        type="text"
                        value={editingQuestion.options[idx]}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[idx] = e.target.value;
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOptions,
                          });
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder={`Đáp án ${letter}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tích vào ô bên cạnh đáp án để chọn đáp án đúng
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Giải thích (tùy chọn)
                </label>
                <textarea
                  value={editingQuestion.explanation}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={2}
                  placeholder="Nhập giải thích cho câu hỏi..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setEditingQuestion(null);
                }}
                className="flex-1 border border-border py-2.5 rounded-xl font-bold text-sm hover:bg-muted transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveQuestion}
                className="flex-1 gradient-green text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonPlayer({ lesson, onBack }) {
  const [speaking, setSpeaking] = useState(false);
  const uttRef = useRef(null);
  const audioRef = useRef(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [questions] = useState(lesson.questions || []);
  const [transcriptEn] = useState(lesson.transcript || lesson.audio_script || "");
  const [transcriptVi] = useState(lesson.vi_translation || "");

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const text = transcriptEn;
    if (!text) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.85;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    uttRef.current = utt;
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  const speakVietnamese = (text) => {
    window.speechSynthesis.cancel();
    if (!text) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "vi-VN";
    utt.rate = 0.9;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    uttRef.current = utt;
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) return;
    stopAudio();
    setSubmitting(true);
    setSubmitError("");
    try {
      const answerList = questions.map((q, i) => ({
        questionId: q.id,
        answer: ["A", "B", "C", "D"][answers[i]] || "",
      }));
      const data = await listeningApi.submitListeningPractice(lesson.id, answerList);
      setResult(data);
      setSubmitted(true);
      setShowTranscript(true);
      setTimeout(() => {
        if (audioUrl) {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        } else {
          speak();
        }
      }, 300);
    } catch (err) {
      setSubmitError(err.message || "Không thể nộp bài");
      setSubmitting(false);
    }
  };

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const answeredCount = Object.keys(answers).length;
  const audioUrl = lesson.audioUrl || lesson.audio_url || "";

  const getResults = () => {
    if (submitted && result) {
      return questions.map((q, i) => {
        const answerData = result.details?.find((d) => d.questionId === q.id);
        const userAnswerIndex = answers[i];
        const userAnswer = ["A", "B", "C", "D"][userAnswerIndex] || "";
        const correctIndex = ["A", "B", "C", "D"].indexOf(q.correct_answer);
        const isCorrect = answerData
          ? answerData.isCorrect
          : userAnswer === q.correct_answer;
        return {
          ...q,
          isCorrect,
          userAnswer,
          userAnswerIndex,
        };
      });
    }
    return questions.map((q, i) => {
      const userAnswerIndex = answers[i];
      const userAnswer = ["A", "B", "C", "D"][userAnswerIndex] || "";
      const isCorrect = userAnswer === q.correct_answer;
      return {
        ...q,
        isCorrect,
        userAnswer,
        userAnswerIndex,
      };
    });
  };

  const results = submitted ? getResults() : [];
  const correctCount = submitted ? results.filter((r) => r.isCorrect).length : 0;
  const wrongCount = submitted ? questions.length - correctCount : 0;
  const percentage =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (showExitConfirm) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">Xác nhận thoát</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Bạn có chắc muốn thoát? Tiến trình hiện tại sẽ không được lưu.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="flex-1 border border-border py-2.5 rounded-xl font-bold text-sm hover:bg-muted transition-all"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                stopAudio();
                onBack();
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trang kết quả chi tiết
  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <button
          onClick={() => {
            stopAudio();
            onBack();
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Tổng kết quả */}
        <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto text-center shadow-md mb-6">
          <h2 className="text-lg font-black mb-1">Kết quả bài luyện nghe</h2>
          <div className="text-5xl font-black text-primary my-3">{percentage}%</div>
          <p className="text-muted-foreground font-medium">
            {correctCount}/{questions.length} câu đúng
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">
                {correctCount}
              </div>
              <div className="text-xs text-muted-foreground">Đúng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-500">{wrongCount}</div>
              <div className="text-xs text-muted-foreground">Sai</div>
            </div>
          </div>
        </div>

        {/* Audio player */}
        <div className="max-w-lg mx-auto mb-6">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                {audioUrl ? (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    className="h-14 rounded-lg"
                    onEnded={() => setSpeaking(false)}
                  />
                ) : (
                  <button
                    onClick={speaking ? stopAudio : speak}
                    className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    {speaking ? (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <Play className="w-7 h-7" />
                    )}
                  </button>
                )}
              </div>
              <div>
                <p className="font-bold flex items-center gap-2">
                  {speaking ? (
                    <><Volume2 className="w-4 h-4 animate-pulse" /> Đang phát...</>
                  ) : (
                    "Nghe lại bài nghe"
                  )}
                </p>
                <p className="text-green-100 text-sm">Text-to-Speech</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript */}
        {(transcriptEn || transcriptVi) && (
          <div className="max-w-lg mx-auto mb-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-md">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full p-4 font-bold text-sm cursor-pointer hover:bg-muted flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Nội dung bài nghe & Bản dịch
                </span>
                {showTranscript ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showTranscript && (
                <div className="p-4 pt-0 space-y-4">
                  {transcriptEn && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">Tiếng Anh</p>
                      <p className="text-sm text-foreground whitespace-pre-line font-medium">
                        {transcriptEn}
                      </p>
                    </div>
                  )}
                  {transcriptVi && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">Tiếng Việt</p>
                      <p className="text-sm text-foreground whitespace-pre-line font-medium">
                        {transcriptVi}
                      </p>
                      <button
                        onClick={() => speakVietnamese(transcriptVi)}
                        className="mt-2 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        Nghe bản dịch
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chi tiết từng câu */}
        <div className="space-y-4 max-w-lg mx-auto">
          {results.map((q, qi) => {
            const borderColor = q.isCorrect
              ? "border-green-400 bg-green-50"
              : "border-red-400 bg-red-50";
            const iconColor = q.isCorrect ? "text-green-500" : "text-red-500";
            const Icon = q.isCorrect ? CheckCircle : XCircle;
            const correctIndex = ["A", "B", "C", "D"].indexOf(q.correct_answer);

            return (
              <div key={q.id ?? qi} className={`rounded-2xl p-4 border-2 ${borderColor}`}>
                <div className="flex items-start gap-3 mb-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Câu {qi + 1}
                    </p>
                    <h3 className="text-lg font-black text-foreground">
                      {q.question}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2">
                  {q.options?.map((opt, oi) => {
                    const isCorrectOption = oi === correctIndex;
                    const isSelectedOption = oi === q.userAnswerIndex;
                    let style = "bg-white border-border";
                    if (isCorrectOption)
                      style =
                        "bg-green-100 border-green-500 text-green-700 font-semibold";
                    else if (isSelectedOption && !isCorrectOption)
                      style = "bg-red-100 border-red-500 text-red-700";
                    return (
                      <div
                        key={oi}
                        className={`w-full p-3 rounded-xl border-2 text-sm text-left flex items-center justify-between ${style}`}
                      >
                        <span>
                          <span className="font-bold mr-2">
                            {["A", "B", "C", "D"][oi]}:
                          </span>
                          {opt}
                        </span>
                        {isCorrectOption && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        {isSelectedOption && !isCorrectOption && (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {!q.isCorrect && (
                  <p className="text-xs text-red-600 font-medium mt-2">
                    Đáp án đúng:{" "}
                    <span className="font-black">
                      {["A", "B", "C", "D"][correctIndex]}
                    </span>
                  </p>
                )}
                {q.explain && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                    <strong>Giải thích:</strong> {q.explain}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="max-w-lg mx-auto mt-6">
          <button
            onClick={() => {
              stopAudio();
              onBack();
            }}
            className="w-full gradient-green text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
          >
            Quay lại danh sách bài
          </button>
        </div>
      </div>
    );
  }

  // Giao diện đang làm bài - KHÔNG có nút chỉnh sửa
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Thoát
        </button>
        <span className="text-sm font-bold text-muted-foreground">
          {answeredCount}/{questions.length} đã trả lời
        </span>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">
          {lesson.title}
        </h1>

        {/* Audio player */}
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              {audioUrl ? (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="h-14 rounded-lg"
                  onEnded={() => setSpeaking(false)}
                />
              ) : (
                <button
                  onClick={speaking ? stopAudio : speak}
                  disabled={speaking && !audioUrl}
                  className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  {speaking ? (
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <Play className="w-7 h-7" />
                  )}
                </button>
              )}
            </div>
            <div>
              <p className="font-bold flex items-center gap-2">
                {speaking ? (
                  <><Volume2 className="w-4 h-4 animate-pulse" /> Đang phát...</>
                ) : (
                  "Nhấn ▶ để nghe bài"
                )}
              </p>
              <p className="text-green-100 text-sm">
                {speaking ? "Nhấn ■ để dừng" : "Text-to-Speech"}
              </p>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {submitError}
          </div>
        )}

        {questions.length > 0 && (
          <div>
            <h2 className="font-black text-foreground mb-4">Câu hỏi</h2>

            {/* Thanh tiến trình */}
            <div className="flex items-center gap-1 mb-6 justify-center flex-wrap">
              {questions.map((q, idx) => {
                const isAnswered = answers[idx] !== undefined;
                return (
                  <button
                    key={q.id ?? idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      idx === currentIndex
                        ? "bg-primary text-white scale-110"
                        : isAnswered
                        ? "bg-primary/30 text-primary"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Hiển thị câu hỏi hiện tại */}
            {questions[currentIndex] && (
              <div className="bg-white rounded-2xl border border-border p-5 mb-4">
                <p className="font-bold text-foreground mb-3">
                  Câu {currentIndex + 1}. {questions[currentIndex].question}
                </p>
                <div className="space-y-2">
                  {questions[currentIndex].options?.map((opt, oi) => {
                    const chosen = answers[currentIndex] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() =>
                          setAnswers({ ...answers, [currentIndex]: oi })
                        }
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          chosen
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-white hover:border-primary/40"
                        }`}
                      >
                        <span className="font-bold mr-2">
                          {["A", "B", "C", "D"][oi]}:
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nút điều hướng câu hỏi */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Câu trước
              </button>
              <span className="text-sm text-muted-foreground font-medium">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <button
                onClick={() =>
                  setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))
                }
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Câu tiếp <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {/* Nút nộp bài */}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="w-full gradient-green text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting
                ? "Đang nộp bài..."
                : allAnswered
                ? "✓ Nộp bài ngay"
                : `Nộp bài (${answeredCount}/${questions.length})`}
            </button>
            {!allAnswered && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Vui lòng trả lời tất cả câu hỏi trước khi nộp bài
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Component xử lý route /listening/:id/practice
function ListeningPractice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true);
      try {
        const detail = await listeningApi.getLessonById(id);
        setLesson(detail);
      } catch (err) {
        console.error("Không thể tải bài luyện nghe:", err);
        navigate("/listening");
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Đang tải bài luyện nghe...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return <LessonPlayer lesson={lesson} onBack={() => navigate("/listening")} />;
}

// Export LessonPlayer để có thể sử dụng ở nơi khác (nếu cần)
export { LessonPlayer, ListeningPractice };
