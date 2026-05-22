import { useState, useEffect } from "react";
import {
  BookOpen,

  Search,
  Loader2,
  Eye,
  Lock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Globe,
  FileText,
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
import { vocabularyApi } from "@/api/client/vocabularyApi";

// Trang quản lý bộ từ vựng dành cho admin
export default function AdminVocabulary() {
  const [tab, setTab] = useState("pending"); // "pending" | "all"
  const [pendingSets, setPendingSets] = useState([]);
  const [allSets, setAllSets] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedSet, setSelectedSet] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSet, setEditingSet] = useState(null);

  useEffect(() => {
    loadData();
  }, [tab, pendingPage, allPage, search]);

  // Tải danh sách bộ từ vựng theo tab đang chọn
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (tab === "pending") {
        const res = await adminApi.getVocabPending({
          page: pendingPage,
          limit: 15,
          keyword: search,
        });
        // Backend trả về { items, pagination: { page, limit, total, totalPages } } trong res.data
        setPendingSets(res.data?.items || []);
        setPendingTotal(res.data?.pagination?.total ?? 0);
      } else {
        // Backend trả về { items, pagination: { page, limit, total, totalPages } } trong res.data
        const res = await adminApi.getAllVocabularySets({
          page: allPage,
          limit: 15,
          keyword: search,
        });
        setAllSets(res.data?.items || []);
        setAllTotal(res.data?.pagination?.total ?? 0);
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Duyệt bộ từ vựng
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.approveVocabSet(id);
      setPendingSets((prev) => prev.filter((s) => s.id !== id));
      setPendingTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Duyệt thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  // Từ chối bộ từ vựng
  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.rejectVocabSet(id);
      setPendingSets((prev) => prev.filter((s) => s.id !== id));
      setPendingTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Từ chối thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  // Khoá bộ từ vựng (chuyển từ công khai về riêng tư)
  const handleLock = async (id) => {
    setActionLoading(id);
    try {
      await vocabularyApi.makePrivate(id);
      setAllSets((prev) => prev.filter((s) => s.id !== id));
      setAllTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Không thể chuyển bộ từ về riêng tư");
    } finally {
      setActionLoading(null);
    }
  };

  // Tạo bộ từ vựng mới
  const handleCreate = async (data) => {
    try {
      await adminApi.createVocabSet(data);
      setShowCreateModal(false);
      if (tab === "all") loadData();
    } catch (err) {
      setError(err.message || "Tạo thất bại");
    }
  };

  // Cập nhật bộ từ vựng
  const handleEdit = async (data) => {
    if (!editingSet) return;
    try {
      await vocabularyApi.updateSet(editingSet.id, data);
      setShowEditModal(false);
      setEditingSet(null);
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
            <BookOpen className="w-7 h-7 text-blue-500" />
            Quản lý Từ vựng
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Duyệt và quản lý bộ từ vựng</p>
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
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
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
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
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
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Số từ</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                </td>
              </tr>
            ) : tab === "pending" ? (
              pendingSets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Không có bộ từ vựng nào chờ duyệt</p>
                  </td>
                </tr>
              ) : (
                pendingSets.map((set) => (
                  <tr key={set.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{set.title}</div>
                      {set.description && (
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{set.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        <Clock className="w-3 h-3" /> Chờ duyệt
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-medium text-slate-600">
                      {set.wordCount ?? 0} từ
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedSet(set)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(set.id)}
                          disabled={actionLoading === set.id}
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          title="Duyệt"
                        >
                          {actionLoading === set.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(set.id)}
                          disabled={actionLoading === set.id}
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
            ) : allSets.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Không có dữ liệu</p>
                </td>
              </tr>
            ) : (
              allSets.map((set) => (
                <tr key={set.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{set.title}</div>
                    {set.description && (
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{set.description}</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      <Globe className="w-3 h-3" /> Công khai
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-sm font-medium text-slate-600">
                    {set.wordCount ?? 0} từ
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedSet(set)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={actionLoading === set.id}
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
                              Bạn có chắc chắn muốn chuyển bộ từ vựng này về chế độ Riêng tư không?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleLock(set.id)}>Xác nhận</AlertDialogAction>
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
      {!isLoading && (tab === "pending" ? pendingSets.length > 0 : allSets.length > 0) && (
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
      {selectedSet && (
        <SetDetailModal set={selectedSet} onClose={() => setSelectedSet(null)} />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateVocabSetModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingSet && (
        <EditVocabSetModal
          set={editingSet}
          onClose={() => {
            setShowEditModal(false);
            setEditingSet(null);
          }}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

// Modal hiển thị chi tiết bộ từ vựng
function SetDetailModal({ set, onClose }) {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, [set.id]);

  // Tải danh sách từ vựng từ API
  const loadWords = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getVocabSetById(set.id);
      // Backend trả về words là pagination object: { items, total, page, limit }
      const wordsData = res.data?.words?.items || [];
      setWords(wordsData);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">{set.title}</h2>
            {set.description && (
              <p className="text-sm text-slate-500 mt-1">{set.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">{words.length} từ vựng</span>
          </div>
          {isLoading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" /></div>
          ) : words.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Chưa có từ vựng nào</p>
          ) : (
            <div className="space-y-2">
              {words.map((word) => (
                <div key={word.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{word.word}</div>
                    {word.pronunciation && (
                      <div className="text-xs text-slate-400">{word.pronunciation}</div>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 font-medium text-right">{word.meaning || word.translation || ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal tạo bộ từ vựng mới
function CreateVocabSetModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý gửi form tạo bộ từ vựng
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">Tạo bộ từ vựng mới</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: IELTS Vocabulary - Environment"
              required
              maxLength={255}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về bộ từ vựng..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Đang tạo..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal chỉnh sửa bộ từ vựng
function EditVocabSetModal({ set, onClose, onSave }) {
  const [title, setTitle] = useState(set.title || "");
  const [description, setDescription] = useState(set.description || "");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý gửi form chỉnh sửa bộ từ vựng
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onSave({ title: title.trim(), description: description.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">Chỉnh sửa bộ từ vựng</h2>
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
