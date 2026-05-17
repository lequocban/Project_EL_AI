import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck, BookOpen, BookText, Headphones,
  Loader2, Eye, Edit2, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, AlertTriangle, Clock,
  Check, X, Filter, Plus, Trash2, Save,
  ArrowUpDown, User, Calendar, Volume2, Play, Pause, Upload,
} from "lucide-react";
import { adminApi } from "@/api/admin";
import { listeningApi } from "@/api/client/listeningApi";

const STATUS_CONFIG = {
  pending: { label: "Chờ duyệt", color: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock },
  approved: { label: "Đã duyệt", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle },
  rejected: { label: "Đã từ chối", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const TAB_CONFIG = [
  { key: "vocabulary", label: "Bộ từ vựng", icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
  { key: "reading", label: "Bài đọc", icon: BookText, gradient: "from-orange-500 to-amber-500" },
  { key: "listening", label: "Bài nghe", icon: Headphones, gradient: "from-green-500 to-teal-500" },
];

const PAGE_SIZE = 15;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const getRequesterName = (requester) => {
  if (!requester) return "—";
  if (typeof requester === "string") return requester;
  if (typeof requester === "object") {
    if (requester.userName) return requester.userName;
    if (requester.email) return requester.email;
    if (requester.name) return requester.name;
    if (requester.id) return `#${requester.id}`;
  }
  return "—";
};

// =============================================
// TRANG CHÍNH
// =============================================
export default function AdminModeration() {
  const [activeTab, setActiveTab] = useState("vocabulary");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      let res;
      const params = { page: pagination.page, limit: PAGE_SIZE, sortField: "created_at", sortOrder, status: statusFilter };
      if (activeTab === "vocabulary") res = await adminApi.getModerationVocabularySets(params);
      else if (activeTab === "reading") res = await adminApi.getModerationReadingLessons(params);
      else res = await adminApi.getModerationListeningLessons(params);

      // Backend trả về: { data: { items, pagination } }
      const apiData = res.data || {};
      const listData = apiData.data || apiData;
      const itemsArray = listData.items || [];
      const paginationData = listData.pagination || {};

      setItems(itemsArray);
      setPagination((prev) => ({
        ...prev,
        total: paginationData.total ?? 0,
        totalPages: paginationData.totalPages ?? 1,
      }));
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, pagination.page, sortOrder, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleReview = async (requestId, action) => {
    const reason = window.prompt(`Nhập lý do ${action === "approve" ? "duyệt" : "từ chối"} (có thể bỏ trống):`);
    setActionLoading(requestId);
    try {
      await adminApi.reviewModerationRequest(requestId, action, reason || "", "");
      loadData();
    } catch (err) {
      setError(err.message || "Thao tác thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-violet-500" />
            Kiểm Duyệt Nội Dung
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Xem xét và phê duyệt nội dung do người dùng gửi lên</p>
        </div>
        <div className="text-sm text-slate-400 font-medium">Tổng: {pagination.total} yêu cầu</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPagination((p) => ({ ...p, page: 1 })); setStatusFilter(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.key ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md` : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30">
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>
        {error && (
          <div className="ml-auto rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />{error}
            <button onClick={() => setError("")} className="underline ml-1">Đóng</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Người gửi</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày gửi</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Không có yêu cầu kiểm duyệt nào</p>
              </td></tr>
            ) : items.map((item) => {
              const status = item.status || "pending";
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              // List API chỉ trả content: { id, title } - không có description
              const title = item.content?.title || "—";
              return (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{title}</div>
                    {item.description && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      <cfg.icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-sm text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />{getRequesterName(item.requester)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />{formatDate(item.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
                        className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      {status === "pending" && (
                        <>
                          <button onClick={() => handleReview(item.id, "approve")} disabled={actionLoading === item.id}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50" title="Duyệt">
                            {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleReview(item.id, "reject")} disabled={actionLoading === item.id}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50" title="Từ chối">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && items.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-1.5 text-sm font-bold text-slate-600">Trang {pagination.page} / {pagination.totalPages}</span>
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <ModerationDetailModal
          item={selectedItem}
          tab={activeTab}
          onClose={() => { setShowDetailModal(false); setSelectedItem(null); }}
          onReviewed={loadData}
        />
      )}
    </div>
  );
}

// =============================================
// MODAL CHI TIẾT
// =============================================
function ModerationDetailModal({ item, tab, onClose, onReviewed }) {
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Reset editing khi mở modal mới
  useEffect(() => {
    setIsEditing(false);
    loadDetail();
  }, [item.id]);

  const loadDetail = async () => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await adminApi.getModerationRequest(item.id);
      // Backend trả về: { code, success, message, data: { id, contentType, contentId, status, requester, reviewer, content: { id, title, description, words/questions/audioUrl... } } }
      const apiData = res.data || {};
      const detailData = apiData.data || {};
      // content chứa dữ liệu chi tiết của bộ từ vựng/bài đọc/bài nghe
      const content = detailData.content || {};
      // Merge content lên root level để các Tab truy cập thuận tiện
      setDetail({ ...detailData, ...content });
    } catch (err) {
      // Chỉ hiện lỗi khi thực sự không load được dữ liệu
      // Nếu API thành công nhưng response format không đúng, vẫn hiện modal với dữ liệu có thể có
      console.error("Lỗi tải chi tiết:", err);
      setDetailError(err.message || "Không thể tải chi tiết yêu cầu kiểm duyệt");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async (action) => {
    const reason = window.prompt(`Nhập lý do ${action === "approve" ? "duyệt" : "từ chối"} (có thể bỏ trống):`);
    setIsReviewing(true);
    try {
      await adminApi.reviewModerationRequest(item.id, action, reason || "", "");
      onReviewed();
      onClose();
    } catch (err) {
      setDetailError(err.message || "Thao tác thất bại");
    } finally {
      setIsReviewing(false);
    }
  };

  const effectiveStatus = detail?.status || item.status || "pending";
  const StatusCfg = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;
  const TabIcon = TAB_CONFIG.find((t) => t.key === tab)?.icon || BookOpen;

  // Moderation request có: contentId (ID nội dung), content (dữ liệu chi tiết)
  // content chứa: id, title, description, words/questions/audioUrl, transcript, viTranslation...
  const contentId = detail?.contentId || item.contentId;
  const requesterName = getRequesterName(detail?.requester || item.requester);
  const reviewerName = detail?.reviewer ? getRequesterName(detail.reviewer) : null;

  // Lấy words/questions từ root level (đã merge với content ở loadDetail)
  // Đảm bảo luôn là array bằng || [] thay vì ??
  const words = Array.isArray(detail?.words) ? detail.words : [];
  const questions = Array.isArray(detail?.questions) ? detail.questions : [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TabIcon className={`w-5 h-5 ${tab === "vocabulary" ? "text-blue-500" : tab === "reading" ? "text-orange-500" : "text-green-500"}`} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {tab === "vocabulary" ? "Bộ từ vựng" : tab === "reading" ? "Bài luyện đọc" : "Bài luyện nghe"}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900">{detail?.title || "—"}</h2>
            {detail?.description && <p className="text-sm text-slate-500 mt-1">{detail.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${StatusCfg.color}`}>
              <StatusCfg.icon className="w-3 h-3" />{StatusCfg.label}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Chỉ hiện lỗi ở đây, không block hiển thị dữ liệu */}
          {detailError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />{detailError}
              <button onClick={() => setDetailError("")} className="ml-auto underline">Đóng</button>
            </div>
          )}

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <span className="ml-3 text-slate-500">Đang tải chi tiết...</span>
            </div>
          ) : (
            <>
              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Người gửi</p>
                  <p className="text-sm font-bold text-slate-800">{requesterName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày gửi</p>
                  <p className="text-sm font-bold text-slate-800">{formatDate(detail?.createdAt || item.createdAt)}</p>
                </div>
                {reviewerName && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Người duyệt</p>
                    <p className="text-sm font-bold text-slate-800">{reviewerName}</p>
                  </div>
                )}
                {detail?.reason && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lý do</p>
                    <p className="text-sm font-bold text-slate-800">{detail.reason}</p>
                  </div>
                )}
                {detail?.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ghi chú</p>
                    <p className="text-sm font-bold text-slate-800">{detail.notes}</p>
                  </div>
                )}
              </div>

              {/* Nội dung chi tiết theo tab */}
              {tab === "vocabulary" && contentId && (
                <VocabularyTab detail={detail} contentId={contentId} isEditing={isEditing} setIsEditing={setIsEditing} />
              )}
              {tab === "reading" && contentId && (
                <ReadingTab detail={detail} contentId={contentId} isEditing={isEditing} setIsEditing={setIsEditing} />
              )}
              {tab === "listening" && contentId && (
                <ListeningTab detail={detail} contentId={contentId} isEditing={isEditing} setIsEditing={setIsEditing} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            {effectiveStatus === "pending" && !detailLoading && contentId && (
              <button
                onClick={() => setIsEditing((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isEditing ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200"
                }`}>
                <Edit2 className="w-4 h-4" />{isEditing ? "Hủy sửa" : "Chỉnh sửa"}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Đóng</button>
            {effectiveStatus === "pending" && !detailLoading && (
              <>
                <button onClick={() => handleReview("reject")} disabled={isReviewing || isEditing}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors">
                  <XCircle className="w-4 h-4" />Từ chối
                </button>
                <button onClick={() => handleReview("approve")} disabled={isReviewing || isEditing}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                  <CheckCircle className="w-4 h-4" />Duyệt
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// TAB BỘ TỪ VỰNG
// Backend detail trả về: { id, title, description, words: [{id, word, phonetic, meaning}] }
// contentId là moderation_request.contentId (ID của bộ từ vựng)
// =============================================
function VocabularyTab({ detail, contentId, isEditing, setIsEditing }) {
  // detail đã merge với content nên words ở root level
  const words = detail?.words || [];
  const [newWord, setNewWord] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedIds, setSelectedIds] = useState([]);

  const showMsg = (text, type = "error") => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setSaving(true);
    try {
      await adminApi.addWordsToVocabSet(contentId, [newWord.trim()]);
      setNewWord("");
      showMsg("Thêm từ thành công!", "success");
      // Reload để lấy data mới
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showMsg(err.message || "Thêm từ thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWords = async () => {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      await adminApi.removeWordsFromVocabSet(contentId, selectedIds);
      setSelectedIds([]);
      showMsg("Xóa từ thành công!", "success");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showMsg(err.message || "Xóa từ thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {msg.text && (
        <div className={`rounded-xl border p-3 text-sm font-medium flex items-center gap-2 ${
          msg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Danh sách từ ({words.length})</h3>
          {isEditing && selectedIds.length > 0 && (
            <button onClick={handleRemoveWords} disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />Xóa ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Form thêm từ */}
        {isEditing && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex gap-2">
              <input type="text" value={newWord} onChange={(e) => setNewWord(e.target.value)}
                placeholder="Nhập từ mới..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()} />
              <button onClick={handleAddWord} disabled={saving || !newWord.trim()}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50">
                <Plus className="w-4 h-4" />Thêm
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ tự động tra phonetic và nghĩa cho từ.</p>
          </div>
        )}

        {/* Danh sách từ - dữ liệu từ detail.words (root level) */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {words.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Chưa có từ nào</p>
          ) : words.map((w) => (
            <div key={w.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
              selectedIds.includes(w.id) ? "bg-blue-50 border-blue-300" : "bg-white border-slate-100 hover:border-slate-200"
            }`}>
              {isEditing && (
                <input type="checkbox" checked={selectedIds.includes(w.id)}
                  onChange={(e) => setSelectedIds((prev) => e.target.checked ? [...prev, w.id] : prev.filter((i) => i !== w.id))}
                  className="w-4 h-4 rounded border-slate-300 text-blue-500" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm">{w.word}</div>
                {w.phonetic && <div className="text-xs text-slate-400">{w.phonetic}</div>}
              </div>
              <div className="text-sm text-slate-600 font-medium text-right">{w.meaning || "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
// TAB BÀI ĐỌC
// Backend detail trả về: { title, content, viTranslation, questions: [{id, question, optionA, optionB, optionC, optionD, correctAnswer, explain}] }
// =============================================
function ReadingTab({ detail, contentId, isEditing, setIsEditing }) {
  const [editContent, setEditContent] = useState("");
  const [editVi, setEditVi] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editQ, setEditQ] = useState(null);
  const [editQData, setEditQData] = useState({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "" });
  const [showAddQ, setShowAddQ] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Sync khi detail thay đổi (detail đã merge với content từ backend)
  useEffect(() => {
    if (detail) {
      setEditContent(detail.content || "");
      setEditVi(detail.vi_translation || detail.viTranslation || "");
      const qs = (detail.questions || []).map((q) => ({
        id: q.id, question: q.question || "",
        optionA: q.option_a || q.optionA || "",
        optionB: q.option_b || q.optionB || "",
        optionC: q.option_c || q.optionC || "",
        optionD: q.option_d || q.optionD || "",
        correctAnswer: q.correct_answer || q.correctAnswer || "A",
        explanation: q.explanation || q.explain || "",
      }));
      setQuestions(qs);
    }
  }, [detail]);

  const showMsg = (text, type = "error") => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateReadingLesson(contentId, {
        title: detail.title, description: detail.description,
        content: editContent, vi_translation: editVi,
      });
      showMsg("Lưu thành công!", "success");
    } catch (err) {
      showMsg(err.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Backend không có endpoint tạo/xóa câu hỏi - chỉ có thể sửa câu hỏi hiện có
  const handleAddQ = () => {
    showMsg("Không thể tạo câu hỏi mới từ trang kiểm duyệt. Vui lòng yêu cầu người gửi bổ sung.", "error");
  };

  const handleEditQ = (q) => { setEditQ(q.id); setEditQData({ ...q }); setShowAddQ(true); };

  const handleSaveQ = async () => {
    if (!editQData.question.trim() || !editQData.optionA.trim() || !editQData.optionB.trim() || !editQData.optionC.trim() || !editQData.optionD.trim()) {
      alert("Vui lòng nhập đầy đủ câu hỏi và 4 đáp án"); return;
    }
    if (!editQ) {
      alert("Không thể tạo câu hỏi mới từ trang kiểm duyệt"); return;
    }
    setSaving(true);
    try {
      // Backend nhận: option_a, option_b, option_c, option_d, correct_answer, explain (snake_case)
      await adminApi.updateReadingQuestion(editQ, contentId, {
        question: editQData.question,
        option_a: editQData.optionA,
        option_b: editQData.optionB,
        option_c: editQData.optionC,
        option_d: editQData.optionD,
        correct_answer: editQData.correctAnswer,
        explain: editQData.explanation,
      });
      setQuestions((prev) => prev.map((q) => (q.id === editQ ? { ...editQData, id: editQ } : q)));
      showMsg("Lưu câu hỏi thành công!", "success");
      setShowAddQ(false); setEditQ(null);
    } catch (err) {
      showMsg(err.message || "Lưu câu hỏi thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQ = () => {
    showMsg("Không thể xóa câu hỏi từ trang kiểm duyệt. Vui lòng yêu cầu người gửi chỉnh sửa.", "error");
  };

  return (
    <div className="space-y-4">
      {msg.text && (
        <div className={`rounded-xl border p-3 text-sm font-medium flex items-center gap-2 ${
          msg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Nội dung tiếng Anh */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Nội dung tiếng Anh</h3>
        {isEditing ? (
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            placeholder="Nhập nội dung..." />
        ) : (
          <div className="text-sm text-slate-700 whitespace-pre-wrap">{editContent || <span className="text-slate-400 italic">Chưa có nội dung</span>}</div>
        )}
      </div>

      {/* Nội dung tiếng Việt */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Nội dung tiếng Việt</h3>
        {isEditing ? (
          <textarea value={editVi} onChange={(e) => setEditVi(e.target.value)} rows={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            placeholder="Nhập bản dịch..." />
        ) : (
          <div className="text-sm text-slate-700 whitespace-pre-wrap">{editVi || <span className="text-slate-400 italic">Chưa có bản dịch</span>}</div>
        )}
      </div>

      {/* Câu hỏi */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Câu hỏi ({questions.length})</h3>
          {isEditing && (
            <button onClick={handleAddQ}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600">
              <Plus className="w-3.5 h-3.5" />Thêm câu hỏi
            </button>
          )}
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Chưa có câu hỏi nào</p>
          ) : questions.map((q, idx) => (
            <div key={q.id || idx} className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-slate-800">Câu {idx + 1}: {q.question}</p>
                {isEditing && q.id && (
                  <div className="flex gap-1">
                    <button onClick={() => handleEditQ(q)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><Edit2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {["A", "B", "C", "D"].map((k) => {
                  const label = q[`option${k}`] || "";
                  const isCorrect = q.correctAnswer === k;
                  return (
                    <div key={k} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${isCorrect ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-white text-slate-600 border border-slate-200"}`}>
                      <span className="font-bold mr-1">{k}.</span>{label}{isCorrect && <span className="ml-1 text-emerald-500">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Lưu thay đổi
          </button>
        </div>
      )}

      {/* Modal sửa câu hỏi */}
      {showAddQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddQ(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">{editQ ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h2>
              <button onClick={() => setShowAddQ(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Câu hỏi</label>
                <input type="text" value={editQData.question} onChange={(e) => setEditQData((p) => ({ ...p, question: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  placeholder="Nhập câu hỏi..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">4 đáp án</label>
                {["A", "B", "C", "D"].map((k) => (
                  <div key={k} className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 w-4">{k}.</span>
                    <input type="text" value={editQData[`option${k}`]} onChange={(e) => setEditQData((p) => ({ ...p, [`option${k}`]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      placeholder={`Đáp án ${k}`} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Đáp án đúng:</span>
                <select value={editQData.correctAnswer} onChange={(e) => setEditQData((p) => ({ ...p, correctAnswer: e.target.value }))}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm">
                  {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddQ(false)} className="flex-1 border border-slate-200 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50">Hủy</button>
                <button onClick={handleSaveQ} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 flex items-center justify-center gap-1">
                  <Save className="w-4 h-4" />Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// TAB BÀI NGHE
// Backend detail trả về: { title, audioUrl, transcript, viTranslation, questions: [...] }
// =============================================
function ListeningTab({ detail, contentId, isEditing, setIsEditing }) {
  const [editTitle, setEditTitle] = useState("");
  const [editTranscript, setEditTranscript] = useState("");
  const [editVi, setEditVi] = useState("");
  const [editAudioUrl, setEditAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [editQ, setEditQ] = useState(null);
  const [editQData, setEditQData] = useState({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "" });
  const [showAddQ, setShowAddQ] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const audioRef = useRef(null);

  useEffect(() => {
    if (detail) {
      setEditTitle(detail.title || "");
      setEditTranscript(detail.transcript || "");
      setEditVi(detail.viTranslation || detail.vi_translation || "");
      setEditAudioUrl(detail.audioUrl || detail.audio_url || "");
      const qs = (detail.questions || []).map((q) => ({
        id: q.id, question: q.question || "",
        optionA: q.optionA || q.option_a || "",
        optionB: q.optionB || q.option_b || "",
        optionC: q.optionC || q.option_c || "",
        optionD: q.optionD || q.option_d || "",
        correctAnswer: q.correctAnswer || q.correct_answer || "A",
        explanation: q.explain || q.explanation || "",
      }));
      setQuestions(qs);
    }
  }, [detail]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    };
  }, []);

  const showMsg = (text, type = "error") => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  const handlePlay = () => {
    if (!editAudioUrl) return;
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); audioRef.current.currentTime = 0; setIsPlaying(false); }
      else { audioRef.current.play(); setIsPlaying(true); }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("audio")) { showMsg("Vui lòng chọn file audio"); return; }
    if (file.size > 50 * 1024 * 1024) { showMsg("File audio quá lớn (tối đa 50MB)"); return; }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await listeningApi.uploadAudio(selectedFile, editTitle || "listening", (p) => setUploadProgress(Math.round(p)));
      setEditAudioUrl(url);
      setSelectedFile(null);
      showMsg("Upload audio thành công!", "success");
    } catch (err) {
      showMsg(err.message || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Backend nhận: title, description?, audio_url?, transcript?, vi_translation?
      await adminApi.updateListeningLesson(contentId, {
        title: editTitle,
        audio_url: editAudioUrl,
        transcript: editTranscript,
        vi_translation: editVi,
      });
      showMsg("Lưu thành công!", "success");
    } catch (err) {
      showMsg(err.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Backend không có endpoint tạo/xóa câu hỏi - chỉ có thể sửa câu hỏi hiện có
  const handleAddQ = () => {
    showMsg("Không thể tạo câu hỏi mới từ trang kiểm duyệt. Vui lòng yêu cầu người gửi bổ sung.", "error");
  };

  const handleEditQ = (q) => { setEditQ(q.id); setEditQData({ ...q }); setShowAddQ(true); };

  const handleSaveQ = async () => {
    if (!editQData.question.trim() || !editQData.optionA.trim() || !editQData.optionB.trim() || !editQData.optionC.trim() || !editQData.optionD.trim()) {
      alert("Vui lòng nhập đầy đủ câu hỏi và 4 đáp án"); return;
    }
    if (!editQ) {
      alert("Không thể tạo câu hỏi mới từ trang kiểm duyệt"); return;
    }
    setSaving(true);
    try {
      // Backend nhận: option_a, option_b, option_c, option_d, correct_answer, explain (snake_case)
      await adminApi.updateListeningQuestion(editQ, contentId, {
        question: editQData.question,
        option_a: editQData.optionA,
        option_b: editQData.optionB,
        option_c: editQData.optionC,
        option_d: editQData.optionD,
        correct_answer: editQData.correctAnswer,
        explain: editQData.explanation,
      });
      setQuestions((prev) => prev.map((q) => (q.id === editQ ? { ...editQData, id: editQ } : q)));
      showMsg("Lưu câu hỏi thành công!", "success");
      setShowAddQ(false); setEditQ(null);
    } catch (err) {
      showMsg(err.message || "Lưu câu hỏi thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQ = () => {
    showMsg("Không thể xóa câu hỏi từ trang kiểm duyệt. Vui lòng yêu cầu người gửi chỉnh sửa.", "error");
  };

  return (
    <div className="space-y-4">
      {msg.text && (
        <div className={`rounded-xl border p-3 text-sm font-medium flex items-center gap-2 ${
          msg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Audio player */}
      {editAudioUrl && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <div className="flex items-center gap-4">
            <audio ref={audioRef} src={editAudioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
            <button onClick={handlePlay} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div>
              <p className="font-bold">{isPlaying ? "Đang phát..." : "Nhấn để nghe"}</p>
              <p className="text-green-100 text-xs">Bài nghe</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload audio */}
      {isEditing && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Upload file audio</h3>
          {editAudioUrl && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
              ✓ Đã có audio: {editAudioUrl.split("/").pop()}
            </div>
          )}
          {selectedFile ? (
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpload} disabled={uploading}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 disabled:opacity-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                  </button>
                  <button onClick={() => setSelectedFile(null)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              </div>
              {uploading && <div className="mt-2 w-full bg-green-200 rounded-full h-1.5"><div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }} /></div>}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/30"
              onClick={() => document.getElementById("mod-audio-upload").click()}>
              <input id="mod-audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-slate-600">Kéo thả hoặc nhấn để chọn file mp3</p>
              <p className="text-xs text-slate-400 mt-1">Tối đa 50MB</p>
            </div>
          )}
        </div>
      )}

      {/* Tiêu đề */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Tiêu đề</h3>
        {isEditing ? (
          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
            placeholder="Tiêu đề bài nghe..." />
        ) : (
          <div className="text-sm font-bold text-slate-800">{editTitle || "—"}</div>
        )}
      </div>

      {/* Transcript */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Bản ghi tiếng Anh</h3>
        {isEditing ? (
          <textarea value={editTranscript} onChange={(e) => setEditTranscript(e.target.value)} rows={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
            placeholder="Nhập bản ghi..." />
        ) : (
          <div className="text-sm text-slate-700 whitespace-pre-wrap">{editTranscript || <span className="text-slate-400 italic">Chưa có bản ghi</span>}</div>
        )}
      </div>

      {/* Bản dịch tiếng Việt */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Bản dịch tiếng Việt</h3>
        {isEditing ? (
          <textarea value={editVi} onChange={(e) => setEditVi(e.target.value)} rows={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
            placeholder="Nhập bản dịch..." />
        ) : (
          <div className="text-sm text-slate-700 whitespace-pre-wrap">{editVi || <span className="text-slate-400 italic">Chưa có bản dịch</span>}</div>
        )}
      </div>

      {/* Câu hỏi */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Câu hỏi ({questions.length})</h3>
          {isEditing && (
            <button onClick={handleAddQ}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600">
              <Plus className="w-3.5 h-3.5" />Thêm câu hỏi
            </button>
          )}
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Chưa có câu hỏi nào</p>
          ) : questions.map((q, idx) => (
            <div key={q.id || idx} className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-slate-800">Câu {idx + 1}: {q.question}</p>
                {isEditing && (
                  <div className="flex gap-1">
                    <button onClick={() => handleEditQ(q)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteQ(q.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {["A", "B", "C", "D"].map((k) => {
                  const label = q[`option${k}`] || "";
                  const isCorrect = q.correctAnswer === k;
                  return (
                    <div key={k} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${isCorrect ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-white text-slate-600 border border-slate-200"}`}>
                      <span className="font-bold mr-1">{k}.</span>{label}{isCorrect && <span className="ml-1 text-emerald-500">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Lưu thay đổi
          </button>
        </div>
      )}

      {/* Modal câu hỏi */}
      {showAddQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddQ(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">{editQ ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h2>
              <button onClick={() => setShowAddQ(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Câu hỏi</label>
                <input type="text" value={editQData.question} onChange={(e) => setEditQData((p) => ({ ...p, question: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  placeholder="Nhập câu hỏi..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">4 đáp án</label>
                {["A", "B", "C", "D"].map((k) => (
                  <div key={k} className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 w-4">{k}.</span>
                    <input type="text" value={editQData[`option${k}`]} onChange={(e) => setEditQData((p) => ({ ...p, [`option${k}`]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                      placeholder={`Đáp án ${k}`} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Đáp án đúng:</span>
                <select value={editQData.correctAnswer} onChange={(e) => setEditQData((p) => ({ ...p, correctAnswer: e.target.value }))}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm">
                  {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddQ(false)} className="flex-1 border border-slate-200 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50">Hủy</button>
                <button onClick={handleSaveQ} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 flex items-center justify-center gap-1">
                  <Save className="w-4 h-4" />Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
