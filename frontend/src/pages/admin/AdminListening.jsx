import { useState, useEffect } from "react";
import {
  Headphones,
  Plus,
  Search,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Globe,
  Lock,
  FileAudio,
  Play,
  Pause,
  Upload,
  FileUp,
} from "lucide-react";
import { adminApi } from "@/api/admin/adminApi";
import { listeningApi } from "@/api/client/listeningApi";

export default function AdminListening() {
  const [tab, setTab] = useState("pending");
  const [pendingLessons, setPendingLessons] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  // Load allTotal ngay khi mount (chỉ chạy 1 lần)
  useEffect(() => {
    const loadAllTotal = async () => {
      try {
        const res = await adminApi.getAllListeningLessons({ page: 1, limit: 1000, keyword: "" });
        setAllTotal(res.data?.items?.length || 0);
      } catch {
        // ignore
      }
    };
    loadAllTotal();
  }, []);

  useEffect(() => {
    loadData();
  }, [tab, pendingPage, allPage, search]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (tab === "pending") {
        const res = await adminApi.getListeningPending({
          page: pendingPage,
          limit: 15,
          keyword: search,
        });
        setPendingLessons(res.data?.items || []);
        setPendingTotal(res.data?.total || 0);
      } else {
        // Gọi song song: lấy danh sách để hiển thị (phân trang) và lấy total (limit lớn)
        const [listRes, totalRes] = await Promise.all([
          adminApi.getAllListeningLessons({ page: allPage, limit: 15, keyword: search }),
          adminApi.getAllListeningLessons({ page: 1, limit: 1000, keyword: "" }),
        ]);
        setAllLessons(listRes.data?.items || []);
        const totalItems = totalRes.data?.items || [];
        // Lọc lại theo keyword nếu có
        const filteredTotal = search
          ? totalItems.filter((l) => l.title?.toLowerCase().includes(search.toLowerCase()))
          : totalItems;
        setAllTotal(filteredTotal.length);
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.approveListening(id);
      setPendingLessons((prev) => prev.filter((l) => l.id !== id));
      setPendingTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Duyệt thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.rejectListening(id);
      setPendingLessons((prev) => prev.filter((l) => l.id !== id));
      setPendingTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Từ chối thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài luyện nghe này?")) return;
    setActionLoading(id);
    try {
      await adminApi.deleteListeningLesson(id);
      setAllLessons((prev) => prev.filter((l) => l.id !== id));
      setAllTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Xóa thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (data) => {
    try {
      await adminApi.createListeningLesson(data);
      setShowCreateModal(false);
      if (tab === "all") loadData();
    } catch (err) {
      setError(err.message || "Tạo thất bại");
    }
  };

  const handleEdit = async (data) => {
    if (!editingLesson) return;
    try {
      await listeningApi.updateLesson(editingLesson.id, data);
      setShowEditModal(false);
      setEditingLesson(null);
      loadData();
    } catch (err) {
      setError(err.message || "Cập nhật thất bại");
    }
  };

  const totalPages = tab === "pending"
    ? Math.ceil(pendingTotal / 15) || 1
    : Math.ceil(allTotal / 15) || 1;
  const currentPage = tab === "pending" ? pendingPage : allPage;
  const setPage = tab === "pending" ? setPendingPage : setAllPage;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Headphones className="w-7 h-7 text-green-500" />
            Quản lý Luyện nghe
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Duyệt và quản lý bài luyện nghe</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm bài nghe
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          ["pending", "Chờ duyệt", pendingTotal],
          ["all", "Tất cả", allTotal],
        ].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => {
              setTab(val);
              setSearch("");
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              tab === val
                ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                tab === val ? "bg-white/30 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPendingPage(1);
            setAllPage(1);
          }}
          placeholder="Tìm kiếm theo tiêu đề..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError("")} className="ml-auto underline">Đóng</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Câu hỏi</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto" />
                </td>
              </tr>
            ) : tab === "pending" ? (
              pendingLessons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Không có bài luyện nghe nào chờ duyệt</p>
                  </td>
                </tr>
              ) : (
                pendingLessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{lesson.title}</div>
                      {lesson.audioUrl && (
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <FileAudio className="w-3 h-3" /> {lesson.audioUrl}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        <Clock className="w-3 h-3" /> Chờ duyệt
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-medium text-slate-600">
                      {lesson.questionCount ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedLesson(lesson)}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(lesson.id)}
                          disabled={actionLoading === lesson.id}
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          title="Duyệt"
                        >
                          {actionLoading === lesson.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(lesson.id)}
                          disabled={actionLoading === lesson.id}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Từ chối"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            ) : allLessons.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <Headphones className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Không có dữ liệu</p>
                </td>
              </tr>
            ) : (
              allLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{lesson.title}</div>
                    {lesson.audioUrl && (
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <FileAudio className="w-3 h-3" /> {lesson.audioUrl}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      lesson.status === "public"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : lesson.status === "req_public"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {lesson.status === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {lesson.status === "public" ? "Công khai" : lesson.status === "req_public" ? "Chờ duyệt" : "Riêng tư"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-sm font-medium text-slate-600">
                    {lesson.questionCount ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedLesson(lesson)}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLesson(lesson);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        disabled={actionLoading === lesson.id}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && (tab === "pending" ? pendingLessons.length > 0 : allLessons.length > 0) && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 text-sm font-bold text-slate-600">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateListeningModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingLesson && (
        <EditListeningModal
          lesson={editingLesson}
          onClose={() => {
            setShowEditModal(false);
            setEditingLesson(null);
          }}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

function LessonDetailModal({ lesson, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (lesson?.id) {
      loadLesson();
    }
  }, [lesson?.id]);

  const loadLesson = async () => {
    try {
      const res = await adminApi.getListeningLessonById(lesson.id);
      setData(res.data || lesson);
    } catch {
      setData(lesson);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">{lesson.title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {data?.audioUrl && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <FileAudio className="w-3 h-3 inline mr-1" /> Đường dẫn audio
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-blue-600 font-mono break-all">
                {data.audioUrl}
              </div>
            </div>
          )}
          {data?.transcript && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Bản ghi (Transcript)
              </label>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {data.transcript}
              </div>
            </div>
          )}
          {data?.viTranslation && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Bản dịch tiếng Việt
              </label>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {data.viTranslation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateListeningModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [viTranslation, setViTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        audioUrl: audioUrl.trim(),
        transcript: transcript.trim(),
        viTranslation: viTranslation.trim(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">Tạo bài luyện nghe mới</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Business Phone Call"
              required
              maxLength={255}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Đường dẫn Audio</label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/audio.mp3"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bản ghi (Transcript)</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Nội dung bài nghe..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bản dịch tiếng Việt</label>
            <textarea
              value={viTranslation}
              onChange={(e) => setViTranslation(e.target.value)}
              placeholder="Bản dịch tiếng Việt (tùy chọn)..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Đang tạo..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditListeningModal({ lesson, onClose, onSave }) {
  const [title, setTitle] = useState(lesson.title || "");
  const [audioUrl, setAudioUrl] = useState(lesson.audioUrl || "");
  const [transcript, setTranscript] = useState(lesson.transcript || "");
  const [viTranslation, setViTranslation] = useState(lesson.viTranslation || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioRef) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioRef(audio);
      setIsPlaying(true);
      audio.play();
    } else {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        audioRef.play();
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("audio")) {
      setUploadError("Vui lòng chọn file audio (mp3, wav, v.v.)");
      return;
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File audio quá lớn. Vui lòng chọn file nhỏ hơn 50MB");
      return;
    }
    setSelectedFile(file);
    setUploadError("");
    const previewUrl = URL.createObjectURL(file);
    if (audioRef) {
      audioRef.pause();
      setIsPlaying(false);
    }
    const audio = new Audio(previewUrl);
    audio.onended = () => setIsPlaying(false);
    setAudioRef(audio);
    setAudioUrl(previewUrl);
  };

  const handleRemoveFile = () => {
    if (audioRef) {
      audioRef.pause();
      setIsPlaying(false);
      setAudioRef(null);
    }
    setSelectedFile(null);
    setAudioUrl(lesson.audioUrl || "");
    setUploadProgress(0);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError("");
    setUploadProgress(10);
    try {
      setUploadProgress(30);
      const uploadedUrl = await listeningApi.uploadAudio(selectedFile, title, (progress) => {
        setUploadProgress(Math.round(progress * 0.6 + 30));
      });
      setUploadProgress(100);
      if (audioRef) {
        audioRef.pause();
        setIsPlaying(false);
      }
      setAudioUrl(uploadedUrl);
      setSelectedFile(null);
      setTimeout(() => {
        const audio = new Audio(uploadedUrl);
        audio.onended = () => setIsPlaying(false);
        setAudioRef(audio);
      }, 300);
    } catch (err) {
      setUploadError(err.message || "Không thể upload file audio. Vui lòng thử lại.");
      setUploadProgress(0);
      if (audioRef) {
        audioRef.pause();
        setIsPlaying(false);
        setAudioRef(null);
      }
      setAudioUrl(lesson.audioUrl || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onSave({
        title: title.trim(),
        audioUrl: audioUrl.trim(),
        transcript: transcript.trim(),
        viTranslation: viTranslation.trim(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasAudio = !!audioUrl;
  const isNewAudio = selectedFile !== null;
  const playBtnClass = hasAudio
    ? "bg-green-500 text-white hover:bg-green-600"
    : "bg-slate-200 text-slate-400 cursor-not-allowed";
  const fileLabelClass = isNewAudio
    ? "border-green-400 bg-green-50"
    : "border-slate-300 bg-white";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">Chỉnh sửa bài luyện nghe</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>

          {/* Phần Audio */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">File Audio</label>

            {/* Audio hiện tại / đã chọn */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={togglePlayAudio}
                disabled={!hasAudio}
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${playBtnClass}`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>
              <div className="flex-1 text-xs text-slate-500 truncate">
                {hasAudio ? (
                  isNewAudio ? (
                    <span className="text-amber-600 font-medium">
                      Audio mới: {selectedFile?.name}
                    </span>
                  ) : (
                    <span>Audio hiện tại</span>
                  )
                ) : (
                  <span className="italic">Chưa có audio</span>
                )}
              </div>
              {isNewAudio && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Hủy
                </button>
              )}
            </div>

            {/* Nút chọn file */}
            <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-slate-50 ${fileLabelClass}`}>
              <FileUp className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">
                {isNewAudio ? "Đã chọn file" : "Chọn file audio mới (mp3)"}
              </span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Progress bar upload */}
            {isUploading && (
              <div className="mt-2">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: uploadProgress + "%" }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 text-center">
                  Đang upload... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Nút upload */}
            {isNewAudio && !isUploading && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleUploadFile}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload lên server
                </button>
              </div>
            )}

            {/* Lỗi upload */}
            {uploadError && (
              <p className="text-xs text-red-500 mt-1">{uploadError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bản ghi (Transcript)</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bản dịch tiếng Việt</label>
            <textarea
              value={viTranslation}
              onChange={(e) => setViTranslation(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
