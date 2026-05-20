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
  ShieldCheck,
  Eye,
  SortAsc,
  Settings,
} from "lucide-react";
import { readingApi } from "@/api/client/readingApi";
import PracticeHistoryModal from "@/components/client/practice/PracticeHistoryModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

const LESSONS_PER_PAGE = 6;

// Trang luyện đọc với danh sách bài học và tính năng tạo bài mới
export default function Reading() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("mine");
  const [search, setSearch] = useState("");
  const [startLesson, setStartLesson] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State cho sắp xếp
  const [sortOption, setSortOption] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất", sortField: "created_at", sortOrder: "desc" },
    { value: "oldest", label: "Cũ nhất", sortField: "created_at", sortOrder: "asc" },
    { value: "az", label: "A → Z", sortField: "title", sortOrder: "asc" },
    { value: "za", label: "Z → A", sortField: "title", sortOrder: "desc" },
  ];

  const loadDataRef = useRef(null);
  const safePage = Math.min(currentPage, totalPages);
  const sortOptionRef = useRef(sortOption);

  // Tải danh sách bài luyện đọc theo tab, trang và từ khóa tìm kiếm
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sortOpt = SORT_OPTIONS.find((o) => o.value === sortOptionRef.current) || SORT_OPTIONS[0];
      const data =
        tab === "mine"
          ? await readingApi.getMyLessons({ page: currentPage, limit: LESSONS_PER_PAGE, search, sortField: sortOpt.sortField, sortOrder: sortOpt.sortOrder })
          : await readingApi.getPublicLessons({ page: currentPage, limit: LESSONS_PER_PAGE, search, sortField: sortOpt.sortField, sortOrder: sortOpt.sortOrder });
      setLessons(data.items || []);
      setTotalPages(Math.max(1, data.totalPages || 1));
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu luyện đọc");
      setLessons([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [tab, search, currentPage]);

  loadDataRef.current = loadData;

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDataRef.current?.();
    }, 300);
    return () => clearTimeout(timer);
  }, [tab, search, currentPage, sortOption]);

  // Cập nhật ref khi sort thay đổi
  useEffect(() => {
    sortOptionRef.current = sortOption;
  }, [sortOption]);

  // Reset về trang 1 khi tab, search hoặc sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, search, sortOption]);

  // Đóng dropdown sắp xếp khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest(".reading-sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown]);

  // Hàm xóa bài luyện đọc
  const handleDeleteLesson = async (e, lessonId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa bài luyện đọc này không?")) return;
    try {
      await readingApi.deleteLesson(lessonId);
      if (lessons.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        await loadData();
      }
    } catch (err) {
      alert(err.message || "Không thể xóa bài luyện đọc");
    }
  };

  // Xử lý sau khi tạo bài đọc thành công
  const handleCreated = async (lesson) => {
    await loadData();
    try {
      const detail = await readingApi.getLessonById(lesson.id);
      setStartLesson(detail);
    } catch {
      // Neu khong lay duoc chi tiet, van reload danh sach binh thuong
    }
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (value) => {
    setSortOption(value);
    setShowSortDropdown(false);
  };

  // Lấy nhãn sắp xếp hiện tại
  const getCurrentSortLabel = () => {
    const opt = SORT_OPTIONS.find((o) => o.value === sortOption);
    return opt ? opt.label : "Sắp xếp";
  };

  if (startLesson) {
    return (
      <ReadingStarter
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
          <h1 className="text-2xl font-black text-foreground">📖 Luyện đọc</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Nâng cao kỹ năng đọc hiểu tiếng Anh
          </p>
        </div>
        {tab === "mine" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-orange-100 transition-all"
            >
              <Clock className="w-4 h-4" />
              Lịch sử
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 gradient-orange text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tạo bài đọc
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
                ? "gradient-orange text-white shadow-md"
                : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search & Sắp xếp */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài luyện đọc theo tiêu đề..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative reading-sort-dropdown">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-xl font-bold text-sm hover:bg-muted transition-all"
          >
            <SortAsc className="w-4 h-4 text-orange-500" />
            <span className="text-foreground">{getCurrentSortLabel()}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                    sortOption === opt.value ? "text-orange-500 bg-orange-50" : "text-foreground"
                  }`}
                >
                  {opt.label}
                  {sortOption === opt.value && (
                    <span className="ml-auto text-orange-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
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
      ) : lessons.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold">
            {search ? "Không tìm thấy bài luyện đọc nào phù hợp" : "Chưa có bài luyện đọc nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={async () => {
                  setDetailLoading(true);
                  try {
                    const detail = await readingApi.getLessonById(lesson.id);
                    setStartLesson(detail);
                  } catch (err) {
                    setError(err.message || "Không thể tải chi tiết bài luyện đọc");
                  } finally {
                    setDetailLoading(false);
                  }
                }}
                className="bg-white rounded-2xl p-5 border border-border card-hover cursor-pointer group relative"
              >
                {tab === "mine" && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteLesson(e, lesson.id)}
                    className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    title="Xóa bài luyện đọc"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-start gap-4 pr-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="w-9 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                ←
              </button>
              {(() => {
                const pages = [];
                const maxVisible = 3;
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else if (safePage <= 2) {
                  pages.push(1, 2, 3);
                } else if (safePage >= totalPages - 1) {
                  pages.push(totalPages - 2, totalPages - 1, totalPages);
                } else {
                  pages.push(safePage - 1, safePage, safePage + 1);
                }
                return pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      safePage === p
                        ? "bg-primary text-white"
                        : "border border-border hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="w-9 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
      {showCreateModal && (
        <CreateReadingModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
      {showHistory && (
        <PracticeHistoryModal
          type="reading"
          onClose={() => setShowHistory(false)}
          getHistory={readingApi.getPracticeHistory}
          getDetail={readingApi.getPracticeDetail}
        />
      )}
    </div>
  );
}

// Modal tạo bài luyện đọc
function CreateReadingModal({ onClose, onCreated }) {
  const [mode, setMode] = useState("manual"); // "manual" | "ai"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form thủ công
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentVi, setContentVi] = useState("");

  // Form AI
  const [aiTitle, setAiTitle] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(3);

  // Xử lý tạo bài đọc thủ công từ form nhập liệu
  const handleManualSubmit = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài luyện đọc");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const lesson = await readingApi.createLesson({
        title: title.trim(),
        content: content.trim() || undefined,
        viTranslation: contentVi.trim() || undefined,
      });
      onCreated(lesson);
      onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo bài luyện đọc");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tạo bài đọc bằng AI với chủ đề và số câu hỏi
  const handleAISubmit = async () => {
    if (!aiTitle.trim()) {
      setError("Vui lòng nhập tiêu đề bài luyện đọc");
      return;
    }
    if (!aiTopic.trim()) {
      setError("Vui lòng nhập chủ đề bài luyện đọc");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const lesson = await readingApi.generateWithAI({
        title: aiTitle.trim(),
        topic: aiTopic.trim(),
        questionCount: aiQuestionCount,
      });
      onCreated(lesson);
      onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo bài luyện đọc bằng AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-foreground">Tạo bài luyện đọc</h2>
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
                ? "gradient-orange text-white shadow-md"
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
                ? "gradient-orange text-white shadow-md"
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
                placeholder="Nhập tiêu đề bài luyện đọc..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nội dung bài đọc - Tiếng Anh (tùy chọn)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={6}
                placeholder="Nhập nội dung bài đọc tiếng Anh..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nội dung bài đọc - Tiếng Việt (tùy chọn)
              </label>
              <textarea
                value={contentVi}
                onChange={(e) => setContentVi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={6}
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
                placeholder="VD: The Future of Technology"
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
                placeholder="VD: Artificial intelligence and its impact on daily life, including smart homes, self-driving cars, and chatbots"
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
                AI sẽ tạo từ 3 đến 5 câu hỏi cho bài luyện đọc
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
            className="flex-1 gradient-orange text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
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
function ReadingStarter({ lesson, onBack }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState(lesson.questions || []);
  const [passageContent, setPassageContent] = useState(lesson.content || lesson.passage || "");
  const [passageVi, setPassageVi] = useState(lesson.vi_translation || "");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // Theo dõi các câu hỏi đã xóa trong session chỉnh sửa này
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  // Các câu hỏi gốc từ server (dùng để phát hiện thay đổi)
  const originalQuestionsRef = useRef(lesson.questions || []);

  // State cho việc gửi yêu cầu công khai / chuyển riêng tư
  const [isRequestingPublic, setIsRequestingPublic] = useState(false);
  const [isMakingPrivate, setIsMakingPrivate] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showModerationDialog, setShowModerationDialog] = useState(false);

  // State cho dialog Setting
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settingsTab, setSettingsTab] = useState("visibility");
  const [visibilityMode, setVisibilityMode] = useState("private");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Gửi yêu cầu kiểm duyệt (dùng endpoint moderation-requests chung)
  const handleConfirmModeration = async () => {
    setShowModerationDialog(false);
    try {
      setIsRequestingPublic(true);
      setActionMessage("");
      await readingApi.requestModeration(lesson.id);
      setActionMessage("Đã gửi yêu cầu kiểm duyệt! Admin sẽ xem xét và phản hồi.");
    } catch (err) {
      setActionMessage(`Lỗi: ${err.message || "Không thể gửi yêu cầu kiểm duyệt"}`);
      setIsRequestingPublic(false);
    }
  };

  // Chuyển bài luyện đọc về chế độ riêng tư
  const handleMakePrivate = async () => {
    if (!window.confirm("Bạn có muốn chuyển bài luyện đọc này về chế độ riêng tư không?")) {
      return;
    }
    try {
      setIsMakingPrivate(true);
      setActionMessage("");
      await readingApi.makePrivate(lesson.id);
      setActionMessage("Đã chuyển bài luyện đọc về chế độ riêng tư.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setActionMessage(`Lỗi: ${err.message || "Không thể chuyển về chế độ riêng tư"}`);
    } finally {
      setIsMakingPrivate(false);
    }
  };

  // Chuyển sang trang làm bài luyện đọc
  const handleStart = () => {
    navigate(`/reading/${lesson.id}/practice`, {
      state: { lesson: { ...lesson, questions, content: passageContent, vi_translation: passageVi } }
    });
  };

  // Xử lý thay đổi visibility trong dialog Setting
  const handleVisibilitySubmit = async () => {
    setSettingsError("");
    setSettingsSuccess("");
    try {
      if (visibilityMode === "req_public") {
        setIsRequestingPublic(true);
        await readingApi.requestPublic(lesson.id);
        setSettingsSuccess("Đã gửi yêu cầu công khai! Nội dung sẽ được kiểm duyệt.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (visibilityMode === "private" && lesson.status === "public") {
        setIsMakingPrivate(true);
        await readingApi.makePrivate(lesson.id);
        setSettingsSuccess("Đã chuyển về chế độ riêng tư.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setSettingsError(err.message || "Không thể thực hiện thao tác");
    } finally {
      setIsRequestingPublic(false);
      setIsMakingPrivate(false);
    }
  };

  // Xử lý lưu chỉnh sửa trong dialog Setting
  const handleEditSubmit = async () => {
    if (!editTitle.trim()) {
      setSettingsError("Vui lòng nhập tiêu đề bài luyện đọc");
      return;
    }
    setSettingsError("");
    setSettingsSuccess("");
    try {
      setIsSaving(true);
      await readingApi.updateLesson(lesson.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setSettingsSuccess("Đã lưu thay đổi thành công.");
      setTimeout(() => {
        setShowSettingsDialog(false);
      }, 800);
    } catch (err) {
      setSettingsError(err.message || "Không thể cập nhật bài luyện đọc");
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý xoá bài luyện đọc trong dialog Setting
  const handleDeleteLesson = async () => {
    if (!window.confirm("Bạn có chắc muốn xoá bài luyện đọc này không? Hành động này không thể hoàn tác.")) {
      return;
    }
    setSettingsError("");
    try {
      setIsDeleting(true);
      await readingApi.deleteLesson(lesson.id);
      setShowSettingsDialog(false);
      onBack();
    } catch (err) {
      setSettingsError(err.message || "Không thể xoá bài luyện đọc");
    } finally {
      setIsDeleting(false);
    }
  };

  // Mở dialog Setting
  const openSettingsDialog = () => {
    setSettingsTab("visibility");
    setVisibilityMode(lesson?.status || "private");
    setEditTitle(lesson?.title || "");
    setEditDescription(lesson?.description || "");
    setSettingsError("");
    setSettingsSuccess("");
    setTimeout(() => setShowSettingsDialog(true), 0);
  };

  // Lưu content, vi_translation và đồng bộ câu hỏi xuống database
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      // Lưu content và vi_translation trước
      await readingApi.updateLesson(lesson.id, {
        content: passageContent,
        vi_translation: passageVi,
      });

      // 1. Xóa các câu hỏi đã được xóa khỏi giao diện
      if (deletedQuestionIds.length > 0) {
        await Promise.all(
          deletedQuestionIds.map((id) => readingApi.deleteQuestion(id))
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
            readingApi.updateQuestion(q.id, {
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
        const savedQuestions = await readingApi.createBulkQuestions(
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
        // Cập nhật lại ref gốc để lần sau biết được câu hỏi nào là mới
        originalQuestionsRef.current = updatedQuestions;
      } else {
        // Nếu không có câu hỏi mới, cập nhật ref gốc với các thay đổi hiện tại
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

  // Mở modal thêm câu hỏi mới cho bài luyện đọc
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

  // Mở modal chỉnh sửa câu hỏi có sẵn
  const handleEditQuestion = (q) => {
    setEditingQuestion({
      ...q,
      correctAnswer: ["A", "B", "C", "D"].indexOf(q.correct_answer),
    });
    setShowAddQuestion(true);
  };

  // Lưu câu hỏi mới hoặc cập nhật câu hỏi đã chỉnh sửa
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

  // Xóa câu hỏi khỏi danh sách và đánh dấu xóa ở server nếu có id thật
  const handleDeleteQuestion = (id) => {
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
            {/* Các nút Kiểm duyệt và Setting */}
            <div className="flex items-center gap-2">
              {lesson.is_public ? (
                <button
                  onClick={handleMakePrivate}
                  disabled={isMakingPrivate || isRequestingPublic}
                  className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-100 transition-all border border-orange-200 disabled:opacity-50"
                  title="Chuyển về chế độ riêng tư"
                >
                  {isMakingPrivate ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  Riêng tư
                </button>
              ) : lesson.is_pending ? (
                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  Chờ duyệt
                </span>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isMakingPrivate || isRequestingPublic}
                      className="flex items-center gap-1.5 bg-violet-50 text-violet-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-100 transition-all border border-violet-200 disabled:opacity-50"
                      title="Gửi yêu cầu kiểm duyệt"
                    >
                      {isRequestingPublic ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      Kiểm duyệt
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận gửi yêu cầu kiểm duyệt</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có muốn gửi yêu cầu kiểm duyệt cho bài luyện đọc này không? Yêu cầu sẽ được hiển thị trên trang Kiểm duyệt của admin.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmModeration} disabled={isRequestingPublic}>
                        {isRequestingPublic ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang gửi...
                          </>
                        ) : (
                          "Gửi yêu cầu"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <button
                onClick={openSettingsDialog}
                className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all border border-gray-200"
                title="Cài đặt bài đọc"
              >
                <Settings className="w-3.5 h-3.5" />
                Setting
              </button>
              {!isEditing && !lesson.is_public && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-black text-foreground mb-2">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {lesson.description}
            </p>
          )}

          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-4 text-white mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Bài luyện đọc</p>
                <p className="text-orange-100 text-sm">
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
          {actionMessage && (
            <div className={`mb-4 rounded-xl p-3 text-sm font-medium ${
              actionMessage.includes("Lỗi")
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-600 border border-green-200"
            }`}>
              {actionMessage}
            </div>
          )}

          <button
            onClick={handleStart}
            className="w-full gradient-orange text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            Bắt đầu làm bài
          </button>
        </div>

        {/* Phần đoạn văn - chỉ hiện khi đang chỉnh sửa */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <h3 className="font-black text-foreground mb-4">Nội dung bài đọc</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Đoạn văn tiếng Anh
                </label>
                <textarea
                  value={passageContent}
                  onChange={(e) => setPassageContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={8}
                  placeholder="Nhập đoạn văn tiếng Anh..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Đoạn văn tiếng Việt
                </label>
                <textarea
                  value={passageVi}
                  onChange={(e) => setPassageVi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={8}
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

        {/* Nút Hủy / Lưu - chỉ hiện khi đang chỉnh sửa */}
        {isEditing && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                setIsEditing(false);
                setQuestions(lesson.questions || []);
                setPassageContent(lesson.content || lesson.passage || "");
                setPassageVi(lesson.vi_translation || "");
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
              className="flex-1 gradient-orange text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
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
                className="flex-1 gradient-orange text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Setting */}
      {showSettingsDialog && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setShowSettingsDialog(false)}
        >
          <div style={{ backgroundColor: "white", borderRadius: "1rem", width: "100%", maxWidth: "28rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Cài đặt bài đọc
              </h2>
              <button onClick={() => setShowSettingsDialog(false)} className="p-2 rounded-xl hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-border">
              <button
                onClick={() => setSettingsTab("visibility")}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-all ${
                  settingsTab === "visibility"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Công khai
              </button>
              <button
                onClick={() => setSettingsTab("edit")}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-all ${
                  settingsTab === "edit"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Chỉnh sửa
              </button>
            </div>

            <div className="p-6">
              {settingsError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {settingsError}
                </div>
              )}
              {settingsSuccess && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                  {settingsSuccess}
                </div>
              )}

              {settingsTab === "visibility" && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Chọn chế độ hiển thị cho bài luyện đọc
                  </p>

                  {/* Radio options */}
                  <div className="space-y-3">
                    {/* Riêng tư */}
                    <div
                      onClick={() => setVisibilityMode("private")}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        visibilityMode === "private"
                          ? "border-orange-500 bg-orange-50"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        visibilityMode === "private" ? "border-orange-500" : "border-muted-foreground/40"
                      }`}>
                        {visibilityMode === "private" && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground">Riêng tư</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Chỉ bạn mới có thể xem bài này
                        </p>
                      </div>
                      <Lock className={`w-4 h-4 ${visibilityMode === "private" ? "text-orange-500" : "text-muted-foreground/50"}`} />
                    </div>

                    {/* Duyệt công khai */}
                    <div
                      onClick={() => {
                        if (lesson.status !== "req_public" && lesson.status !== "public") {
                          setVisibilityMode("req_public");
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        visibilityMode === "req_public"
                          ? "border-amber-400 bg-amber-50"
                          : "border-border hover:bg-muted"
                      } ${lesson.status === "req_public" || lesson.status === "public" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        visibilityMode === "req_public" ? "border-amber-500" : "border-muted-foreground/40"
                      }`}>
                        {visibilityMode === "req_public" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground">Duyệt công khai</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Gửi yêu cầu để admin kiểm duyệt
                        </p>
                      </div>
                      {lesson.status === "req_public" ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Eye className={`w-4 h-4 ${visibilityMode === "req_public" ? "text-amber-500" : "text-muted-foreground/50"}`} />
                      )}
                    </div>

                    {/* Công khai */}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        lesson.status === "public"
                          ? "border-green-400 bg-green-50"
                          : "border-border opacity-40"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        visibilityMode === "public" ? "border-green-600" : "border-muted-foreground/40"
                      }`}>
                        {visibilityMode === "public" && <div className="w-2 h-2 rounded-full bg-green-600" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground">Công khai</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tất cả người dùng đều có thể xem (chỉ admin mới có thể đặt)
                        </p>
                      </div>
                      <Globe className={`w-4 h-4 ${lesson.status === "public" ? "text-green-600" : "text-muted-foreground/50"}`} />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowSettingsDialog(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted"
                    >
                      Huỷ
                    </button>
                    {(visibilityMode === "req_public" || (visibilityMode === "private" && lesson.status === "public")) && (
                      <button
                        onClick={handleVisibilitySubmit}
                        disabled={isRequestingPublic || isMakingPrivate}
                        className="flex-1 gradient-orange text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isRequestingPublic || isMakingPrivate ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : visibilityMode === "req_public" ? (
                          "Gửi yêu cầu"
                        ) : (
                          "Chuyển về riêng tư"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {settingsTab === "edit" && (
                <div className="space-y-4">
                  {lesson.status !== "private" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                      Không thể chỉnh sửa khi bài đang ở chế độ công khai hoặc chờ duyệt.
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">
                      Tiêu đề *
                    </label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="VD: The Future of Technology"
                      disabled={lesson.status !== "private"}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">
                      Mô tả
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      placeholder="Mô tả ngắn..."
                      disabled={lesson.status !== "private"}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowSettingsDialog(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted"
                    >
                      Huỷ
                    </button>
                    {lesson.status === "private" && (
                      <>
                        <button
                          onClick={handleDeleteLesson}
                          disabled={isDeleting}
                          className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-sm hover:bg-red-100 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Xoá
                        </button>
                        <button
                          onClick={handleEditSubmit}
                          disabled={isSaving || !editTitle.trim()}
                          className="flex-1 gradient-orange text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang lưu...
                            </>
                          ) : (
                            "Lưu"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function ReadingPlayer({ lesson, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPassage, setShowPassage] = useState(true);
  const [passageVi] = useState(lesson.vi_translation || "");
  const [questions] = useState(lesson.questions || []);
  const [passageContent] = useState(lesson.content || lesson.passage || "");
  const [aiExplainingIndex, setAiExplainingIndex] = useState(null); // index của câu đang giải thích AI
  const [aiExplanation, setAiExplanation] = useState(""); // nội dung giải thích AI
  const [aiModalOpen, setAiModalOpen] = useState(false); // dialog AI đang mở

  // Nộp bài luyện đọc và hiển thị kết quả
  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const answerList = questions.map((q, i) => ({
        questionId: q.id,
        answer: ["A", "B", "C", "D"][answers[i]] || "",
      }));
      const data = await readingApi.submitReadingPractice(lesson.id, answerList);
      setResult(data);
      setSubmitted(true);
      setShowPassage(true);
    } catch (err) {
      setSubmitError(err.message || "Không thể nộp bài");
      setSubmitting(false);
    }
  };

  // Gọi AI giải thích đáp án cho một câu hỏi
  const handleExplainWithAI = async (q, qi) => {
    setAiModalOpen(true);
    setAiExplainingIndex(qi);
    setAiExplanation("");
    try {
      const explanation = await readingApi.explainAnswer({
        content: passageContent,
        viTranslation: passageVi,
        question: q.question,
        allAnswers: { a: q.options[0], b: q.options[1], c: q.options[2], d: q.options[3] },
        userAnswer: q.userAnswer,
        correctAnswer: q.correct_answer,
      });
      // Xóa ký tự ** trong giải thích
      setAiExplanation(explanation.replace(/\*\*/g, ""));
    } catch (err) {
      setAiExplanation(`Lỗi: ${err.message || "Không thể lấy giải thích từ AI. Vui lòng thử lại."}`);
    }
  };

  // Lấy kết quả chi tiết từng câu hỏi sau khi nộp bài
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

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const answeredCount = Object.keys(answers).length;
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
              onClick={onBack}
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
      <div className="min-h-screen bg-background p-6 lg:p-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Tổng kết quả */}
        <div className="bg-white rounded-2xl p-6 max-w-5xl mx-auto text-center shadow-md mb-6">
          <h2 className="text-lg font-black mb-1">Kết quả bài luyện đọc</h2>
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

        {/* Đoạn văn với bản dịch từ database */}
        {passageContent && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-md">
              <button
                onClick={() => setShowPassage(!showPassage)}
                className="w-full p-4 font-bold text-sm cursor-pointer hover:bg-muted flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Đoạn văn bài đọc & Bản dịch
                </span>
                {showPassage ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showPassage && (
                <div className="p-4 pt-0 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-orange-600 mb-1">Tiếng Anh</p>
                    <p className="text-sm text-foreground whitespace-pre-line font-medium leading-relaxed">
                      {passageContent}
                    </p>
                  </div>
                  {passageVi && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">Tiếng Việt</p>
                      <p className="text-sm text-foreground whitespace-pre-line font-medium leading-relaxed">
                        {passageVi}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chi tiết từng câu */}
        <div className="space-y-4 max-w-5xl mx-auto">
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
                {/* Nút giải thích bằng AI */}
                <button
                  onClick={() => handleExplainWithAI(q, qi)}
                  className="mt-3 flex items-center gap-2 gradient-orange text-white px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Giải thích bằng AI
                </button>
              </div>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto mt-6">
          <button
            onClick={onBack}
            className="w-full gradient-orange text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
          >
            Quay lại danh sách bài
          </button>
        </div>

        {/* Dialog giải thích bằng AI */}
        {aiModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setAiModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-black text-foreground">Giải thích bằng AI</h3>
                </div>
                <button
                  onClick={() => setAiModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {aiExplanation ? (
                  <p className="text-base text-foreground whitespace-pre-line leading-relaxed">
                    {aiExplanation}
                  </p>
                ) : (
                  <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground text-base">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Đang tải giải thích...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

        {submitError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {submitError}
          </div>
        )}

        {questions.length > 0 && (
          <div>
            {/* Hiển thị đoạn văn tiếng Anh khi đang làm bài */}
            {passageContent && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowPassage(!showPassage)}
                  className="w-full p-4 font-bold text-sm cursor-pointer hover:bg-muted flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Đoạn văn tiếng Anh
                  </span>
                  {showPassage ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showPassage && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-foreground whitespace-pre-line font-medium leading-relaxed bg-orange-50 rounded-xl p-4 border border-orange-100">
                      {passageContent}
                    </p>
                  </div>
                )}
              </div>
            )}

            <h2 className="font-black text-foreground mb-4">Câu hỏi đọc hiểu</h2>

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
                onClick={() =>
                  setCurrentIndex(Math.max(0, currentIndex - 1))
                }
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
                  setCurrentIndex(
                    Math.min(questions.length - 1, currentIndex + 1)
                  )
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
              className="w-full gradient-orange text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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

// Component xử lý route /reading/:id/practice
function ReadingPractice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true);
      try {
        const detail = await readingApi.getLessonById(id);
        setLesson(detail);
      } catch (err) {
        console.error("Không thể tải bài luyện đọc:", err);
        navigate("/reading");
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
          <p className="text-muted-foreground text-sm">Đang tải bài luyện đọc...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return <ReadingPlayer lesson={lesson} onBack={() => navigate("/reading")} />;
}

export { ReadingPlayer, ReadingPractice };
