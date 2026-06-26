import { useState, useEffect } from "react";
import {
  BookText,

  Search,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Globe,
  Lock,
} from "lucide-react";
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
import { adminApi } from "@/api/admin";
import { readingApi } from "@/api/client/readingApi";

// Trang quản lý bài luyện đọc dành cho admin
export default function AdminReading() {
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

  useEffect(() => {
    loadData();
  }, [tab, pendingPage, allPage, search]);

  // Tải danh sách bài đọc theo tab đang chọn
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (tab === "pending") {
        const res = await adminApi.getReadingPending({
          page: pendingPage,
          limit: 15,
          keyword: search,
        });
        // Backend trả về { items, pagination: { page, limit, total, totalPages } } trong res.data
        setPendingLessons(res.data?.items || []);
        setPendingTotal(res.data?.pagination?.total ?? 0);
      } else {
        // Backend trả về { items, pagination: { page, limit, total, totalPages } } trong res.data
        const [listRes] = await Promise.all([
          adminApi.getAllReadingLessons({ page: allPage, limit: 15, keyword: search }),
        ]);
        // Backend trả về { items, pagination: { page, limit, total, totalPages } } trong res.data
        setAllLessons(listRes.data?.items || []);
        setAllTotal(listRes.data?.pagination?.total ?? 0);
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Duyệt bài luyện đọc
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.approveReading(id);
      setPendingLessons((prev) => prev.filter((l) => l.id !== id));
      setPendingTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Duyệt thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  // Từ chối bài luyện đọc
  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.rejectReading(id);
      setPendingLessons((prev) => prev.filter((l) => l.id !== id));
      setPendingTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Từ chối thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  // Khoá bài luyện đọc (chuyển từ công khai về riêng tư)
  const handleLock = async (id) => {
    setActionLoading(id);
    try {
      await readingApi.makePrivate(id);
      setAllLessons((prev) => prev.filter((l) => l.id !== id));
      setAllTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Không thể chuyển bài luyện đọc về riêng tư");
    } finally {
      setActionLoading(null);
    }
  };

  // Tạo bài luyện đọc mới
  const handleCreate = async (data) => {
    try {
      await adminApi.createReadingLesson(data);
      setShowCreateModal(false);
      if (tab === "all") loadData();
    } catch (err) {
      setError(err.message || "Tạo thất bại");
    }
  };

  // Cập nhật bài luyện đọc
  const handleEdit = async (data) => {
    if (!editingLesson) return;
    try {
      await readingApi.updateLesson(editingLesson.id, data);
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
            <BookText className="w-7 h-7 text-orange-500" />
            Quản lý Luyện đọc
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Duyệt và quản lý bài luyện đọc</p>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setTab("pending");
            setSearch("");
          }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            tab === "pending"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Chờ duyệt
        </button>
        <button
          onClick={() => {
            setTab("all");
            setSearch("");
          }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            tab === "all"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Tất cả
        </button>
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
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
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
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                </td>
              </tr>
            ) : tab === "pending" ? (
              pendingLessons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Không có bài luyện đọc nào chờ duyệt</p>
                  </td>
                </tr>
              ) : (
                pendingLessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{lesson.title}</div>
                      {lesson.description && (
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{lesson.description}</div>
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
                          className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
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
                  <BookText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Không có dữ liệu</p>
                </td>
              </tr>
            ) : (
              allLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{lesson.title}</div>
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
                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={actionLoading === lesson.id}
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50"
                            title="Khoá"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Chuyển về Riêng tư</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn chuyển bài luyện đọc này về chế độ Riêng tư không?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleLock(lesson.id)}>Xác nhận</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
        <CreateReadingModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingLesson && (
        <EditReadingModal
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

// Modal hiển thị chi tiết bài luyện đọc
function LessonDetailModal({ lesson, onClose }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lesson?.id) {
      loadLesson();
    }
  }, [lesson?.id]);

  // Tải nội dung bài đọc từ API
  const loadLesson = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getReadingLessonById(lesson.id);
      setData(res.data || lesson);
    } catch {
      setData(lesson);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">{lesson.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
              Đang tải chi tiết bài đọc...
            </div>
          ) : (
            <>
              {/* Nội dung bài đọc */}
              {data?.content && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nội dung bài đọc
                  </label>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {data.content}
                  </div>
                </div>
              )}

              {/* Bản dịch tiếng Việt */}
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

              {/* Danh sách câu hỏi */}
              {data?.questions && data.questions.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Danh sách câu hỏi ({data.questions.length})
                  </label>
                  <div className="space-y-6">
                    {data.questions.map((q, index) => (
                      <div key={q.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                            {index + 1}
                          </span>
                          <p className="text-sm font-bold text-slate-800 pt-0.5">{q.question}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-8">
                          {["A", "B", "C", "D"].map((key) => {
                            const optionText = q[`option${key}`];
                            const isCorrect = q.correctAnswer === key;
                            if (!optionText) return null;
                            return (
                              <div
                                key={key}
                                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                                  isCorrect
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                    : "bg-white border-slate-200 text-slate-600"
                                }`}
                              >
                                <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                                  isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {key}
                                </span>
                                <span>{optionText}</span>
                              </div>
                            );
                          })}
                        </div>

                        {(q.explain || q.explanation) && (
                          <div className="pl-8 pt-1">
                            <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 text-xs text-slate-600 leading-relaxed">
                              <span className="font-bold text-orange-700 block mb-1">Giải thích:</span>
                              {q.explain || q.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal tạo bài luyện đọc mới
function CreateReadingModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [viTranslation, setViTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý gửi form tạo bài đọc mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onCreate({ title: title.trim(), content: content.trim(), viTranslation: viTranslation.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">Tạo bài luyện đọc mới</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: The Impact of Climate Change"
              required
              maxLength={255}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung bài đọc..."
              rows={6}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bản dịch tiếng Việt</label>
            <textarea
              value={viTranslation}
              onChange={(e) => setViTranslation(e.target.value)}
              placeholder="Bản dịch tiếng Việt (tùy chọn)..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Đang tạo..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal chỉnh sửa bài luyện đọc
function EditReadingModal({ lesson, onClose, onSave }) {
  const [title, setTitle] = useState(lesson.title || "");
  const [content, setContent] = useState(lesson.content || "");
  const [viTranslation, setViTranslation] = useState(lesson.viTranslation || "");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý gửi form chỉnh sửa bài đọc
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onSave({ title: title.trim(), content: content.trim(), vi_translation: viTranslation.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">Chỉnh sửa bài luyện đọc</h2>
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bản dịch tiếng Việt</label>
            <textarea
              value={viTranslation}
              onChange={(e) => setViTranslation(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
