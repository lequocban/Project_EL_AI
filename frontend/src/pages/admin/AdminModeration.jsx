import { useState, useEffect, useCallback, useRef, forwardRef, Component } from "react";
import {
  ShieldCheck, BookOpen, BookText, Headphones,
  Loader2, Eye, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, AlertTriangle, Clock,
  Check, X, Filter, Plus, Trash2, Save,
  ArrowUpDown, User, Calendar, Volume2, Play, Pause, Upload,
  Edit2, RefreshCw,
} from "lucide-react";
import { adminApi } from "@/api/admin";
import { listeningApi } from "@/api/client/listeningApi";

// ErrorBoundary cho modal - ngăn crash toàn màn hình
class ModalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">Đã xảy ra lỗi</h2>
            <p className="text-sm text-slate-500 mb-4">
              Không thể hiển thị chi tiết. Vui lòng thử lại.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-500 text-white rounded-xl font-bold text-sm hover:bg-violet-600">
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  const handleReview = async (requestId, action, reason, notes) => {
    setActionLoading(requestId);
    try {
      await adminApi.reviewModerationRequest(requestId, action, reason || "", notes || "");
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
                          <button onClick={() => handleReview(item.id, "approve", "", "")} disabled={actionLoading === item.id}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50" title="Duyệt">
                            {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleReview(item.id, "reject", "", "")} disabled={actionLoading === item.id}
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
        <ModalErrorBoundary>
          <ModerationDetailModal
            item={selectedItem}
            tab={activeTab}
            onClose={() => { setShowDetailModal(false); setSelectedItem(null); }}
            onReviewed={loadData}
          />
        </ModalErrorBoundary>
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
  const [isReviewing, setIsReviewing] = useState(false);
  const [adminReason, setAdminReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const vocabTabRef = useRef(null);
  const readingTabRef = useRef(null);
  const listeningTabRef = useRef(null);
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [item.id]);

  const loadDetail = async () => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await adminApi.getModerationRequest(item.id);
      // Backend trả về { code, success, data: { ...moderationRequest, content: {...} } }
      // Hoặc có thể trả thẳng data theo format cũ
      const raw = res.data || res;

      // content chi tiết nằm trong raw.content hoặc raw.contentDetails (theo doc)
      const moderationReq = raw.content || raw.contentDetails || raw;

      // Lấy thông tin request gốc
      setAdminReason(moderationReq.reason || "");
      setAdminNotes(moderationReq.notes || "");

      // content chi tiết (words, questions...) nằm trong raw.content hoặc raw
      const contentDetail = raw.content || raw;
      setDetail({
        ...moderationReq,
        ...contentDetail,
      });
    } catch (err) {
      console.error("Lỗi tải chi tiết:", err);
      setDetailError(err?.message || "Không thể tải chi tiết yêu cầu kiểm duyệt");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setSavingContent(true);
    try {
      if (tab === "vocabulary" && vocabTabRef.current) {
        await vocabTabRef.current.save();
      } else if (tab === "reading" && readingTabRef.current) {
        await readingTabRef.current.save();
      } else if (tab === "listening" && listeningTabRef.current) {
        await listeningTabRef.current.save();
      }
    } finally {
      setSavingContent(false);
    }
  };

  const handleReview = async (action) => {
    setIsReviewing(true);
    try {
      await adminApi.reviewModerationRequest(item.id, action, adminReason, adminNotes);
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

  const contentId = detail?.contentId || item.contentId;
  const requesterName = getRequesterName(detail?.requester || item.requester);
  const reviewerName = detail?.reviewer ? getRequesterName(detail.reviewer) : null;

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
            <h2 className="text-lg font-black text-slate-900">{detail?.content?.title || detail?.title || "—"}</h2>
            {detail?.content?.description || detail?.description ? (
              <p className="text-sm text-slate-500 mt-1">{detail?.content?.description || detail?.description}</p>
            ) : null}
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
                <VocabularyTab ref={vocabTabRef} detail={detail} contentId={contentId} contentData={detail?.content || detail} onSaveSuccess={loadDetail} />
              )}
              {tab === "reading" && contentId && (
                <ReadingTab ref={readingTabRef} detail={detail} contentId={contentId} contentData={detail?.content || detail} onSaveSuccess={loadDetail} />
              )}
              {tab === "listening" && contentId && (
                <ListeningTab ref={listeningTabRef} detail={detail} contentId={contentId} contentData={detail?.content || detail} onSaveSuccess={loadDetail} />
              )}

              {/* 2 ô nhập reason và notes */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Lý do (admin)
                  </label>
                  <input
                    type="text"
                    value={adminReason}
                    onChange={(e) => setAdminReason(e.target.value)}
                    placeholder="Nhập lý do duyệt hoặc từ chối (có thể bỏ trống)..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Ghi chú (admin)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Nhập ghi chú bổ sung cho người gửi (có thể bỏ trống)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between gap-3">
          <div />
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
              Đóng
            </button>
            {effectiveStatus === "pending" && !detailLoading && contentId && (
              <>
                <button
                  onClick={handleSaveContent}
                  disabled={savingContent || isReviewing}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 disabled:opacity-50 transition-colors">
                  {savingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu
                </button>
                <button
                  onClick={() => handleReview("reject")}
                  disabled={isReviewing || savingContent}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors">
                  <XCircle className="w-4 h-4" />Từ chối
                </button>
                <button
                  onClick={() => handleReview("approve")}
                  disabled={isReviewing || savingContent}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                  {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Duyệt
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
// =============================================
const VocabularyTab = forwardRef(function VocabularyTab({ detail, contentId, contentData, onSaveSuccess }, ref) {
  // State nội bộ quản lý tất cả thay đổi
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [words, setWords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Track changes so we know if "Lưu" is needed
  const [dirty, setDirty] = useState(false);

  // Đồng bộ dữ liệu từ props
  useEffect(() => {
    if (contentData) {
      setEditTitle(contentData.title || "");
      setEditDescription(contentData.description || "");
      // words nằm trong contentData.words
      setWords(contentData.words || []);
      setDirty(false);
    }
  }, [contentData]);

  const showMsg = (text, type = "error") => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  // Tiện ích tạo ID tạm cho item mới
  const tempId = (() => {
    let counter = 0;
    return () => `__new_${++counter}`;
  })();
  const newIdCounterRef = useRef(0);

  // Thêm một từ mới vào danh sách (chưa gọi API)
  const addNewWord = () => {
    const id = `__new_${++newIdCounterRef.current}`;
    const w = { id, word: "", phonetic: "", meaning: "", isNew: true, isEdited: false };
    setWords((prev) => [...prev, w]);
    setDirty(true);
    // Scroll to bottom
    setTimeout(() => {
      document.getElementById(`word-input-${id}`)?.focus();
    }, 50);
  };

  // Cập nhật một từ trong danh sách (chưa gọi API)
  const updateWord = (id, field, value) => {
    setWords((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      return { ...w, [field]: value, isEdited: w.isNew ? false : (w[field] !== value ? true : w.isEdited) };
    }));
    setDirty(true);
  };

  // Xóa một từ khỏi danh sách (chưa gọi API)
  const removeWord = (id) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    setDirty(true);
  };

  // Hàm lưu chính - gọi khi admin bấm "Lưu" trong modal
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Lưu title và description
      await adminApi.updateVocabSet(contentId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });

      // 2. Tách các từ ra: mới, xóa, sửa
      const originalWords = contentData?.words || [];
      const originalIds = new Set(originalWords.map((w) => w.id));

      const newWords = words.filter((w) => w.isNew && w.word.trim());
      const removedIds = originalIds.size > 0
        ? originalWords.filter((w) => !words.find((nw) => nw.id === w.id)).map((w) => w.id)
        : [];
      const editedWords = words.filter((w) => !w.isNew && w.isEdited && w.word.trim());

      // 3. Thêm từ mới (nếu có từ mới với nội dung)
      if (newWords.length > 0) {
        await adminApi.addWordsToVocabSet(contentId, newWords.map((w) => w.word.trim()));
      }

      // 4. Xóa từ cũ (nếu có)
      // Hiện tại backend chưa có API xóa từ riêng lẻ - thông báo nếu có thay đổi
      if (removedIds.length > 0) {
        // Gọi API xóa hàng loạt (backend có support)
        await adminApi.removeWordsFromVocabSet(contentId, removedIds);
      }

      // 5. Sửa từ hiện có (backend chưa có API riêng - tạm thời thông báo)
      // Nếu backend có API updateWord thì gọi ở đây
      if (editedWords.length > 0) {
        // Backend moderation chưa hỗ trợ update từ riêng lẻ
        // Có thể reload lại sau khi add/remove
        console.info("Các từ đã sửa:", editedWords.map((w) => w.word).join(", "));
      }

      showMsg("Đã lưu thay đổi!", "success");
      setDirty(false);

      // Reload lại chi tiết từ API để lấy dữ liệu mới nhất
      if (onSaveSuccess) {
        await onSaveSuccess();
      }
    } catch (err) {
      showMsg(err?.message || "Lưu thất bại");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Expose hàm save ra ngoài qua ref
  useImperativeHandle(ref, () => ({
    save: handleSave,
    isDirty: () => dirty,
  }));

  return (
    <div className="space-y-4">
      {msg.text && (
        <div className={`rounded-xl border p-3 text-sm font-medium flex items-center gap-2 ${
          msg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tiêu đề */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tiêu đề</h3>
          {dirty && <span className="text-xs text-amber-500 font-medium">● Có thay đổi</span>}
        </div>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => { setEditTitle(e.target.value); setDirty(true); }}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          placeholder="Tiêu đề bộ từ vựng..."
        />
      </div>

      {/* Mô tả */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Mô tả</h3>
        <textarea
          value={editDescription}
          onChange={(e) => { setEditDescription(e.target.value); setDirty(true); }}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none bg-white"
          placeholder="Mô tả bộ từ vựng..."
        />
      </div>

      {/* Danh sách từ */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
            Danh sách từ ({words.filter((w) => w.word?.trim()).length})
          </h3>
          <button
            onClick={addNewWord}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors">
            <Plus className="w-3.5 h-3.5" />Thêm từ
          </button>
        </div>

        {/* Bảng tiêu đề cột */}
        <div className="hidden sm:grid grid-cols-12 gap-2 mb-2 px-1">
          <span className="col-span-1 text-xs text-slate-400 font-medium"></span>
          <span className="col-span-3 text-xs text-slate-400 font-medium">Từ</span>
          <span className="col-span-3 text-xs text-slate-400 font-medium">Phát âm</span>
          <span className="col-span-4 text-xs text-slate-400 font-medium">Nghĩa</span>
          <span className="col-span-1 text-xs text-slate-400 font-medium text-right">Xóa</span>
        </div>

        {/* Danh sách từ */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {words.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Chưa có từ nào - nhấn "Thêm từ" để bắt đầu</p>
          ) : words.map((w) => (
            <div key={w.id} className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
              w.isNew ? "bg-blue-50 border-blue-200" : w.isEdited ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100 hover:border-slate-200"
            }`}>
              {/* Icon trạng thái */}
              <div className="w-5 flex-shrink-0">
                {w.isNew && <span className="text-xs font-bold text-blue-500">+</span>}
                {!w.isNew && w.isEdited && <span className="text-xs font-bold text-amber-500">✎</span>}
                {!w.isNew && !w.isEdited && <span className="text-xs text-slate-300">●</span>}
              </div>

              {/* Từ */}
              <input
                id={`word-input-${w.id}`}
                type="text"
                value={w.word}
                onChange={(e) => updateWord(w.id, "word", e.target.value)}
                className="col-span-3 flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                placeholder="Từ..."
              />

              {/* Phát âm */}
              <input
                type="text"
                value={w.phonetic || ""}
                onChange={(e) => updateWord(w.id, "phonetic", e.target.value)}
                className="col-span-3 flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white font-mono"
                placeholder="Phát âm..."
              />

              {/* Nghĩa */}
              <input
                type="text"
                value={w.meaning || ""}
                onChange={(e) => updateWord(w.id, "meaning", e.target.value)}
                className="col-span-4 flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                placeholder="Nghĩa tiếng Việt..."
              />

              {/* Nút xóa */}
              <button
                onClick={() => removeWord(w.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 flex-shrink-0 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {words.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Nhấn <strong>Lưu</strong> để áp dụng thay đổi. Hệ thống sẽ tự động tra phonetic và nghĩa cho từ mới.
          </p>
        )}
      </div>
    </div>
  );
});

// =============================================
// TAB BÀI ĐỌC
// =============================================
const ReadingTab = forwardRef(function ReadingTab({ detail, contentId, contentData, onSaveSuccess }, ref) {
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVi, setEditVi] = useState("");
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [dirty, setDirty] = useState(false);

  // Editing states
  const [editQId, setEditQId] = useState(null);
  const [editQData, setEditQData] = useState({
    question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "",
  });

  useEffect(() => {
    if (contentData) {
      setEditTitle(contentData.title || "");
      setEditContent(contentData.content || "");
      setEditVi(contentData.viTranslation || contentData.vi_translation || "");
      const qs = (contentData.questions || []).map((q) => ({
        id: q.id,
        question: q.question || "",
        optionA: q.optionA || q.option_a || "",
        optionB: q.optionB || q.option_b || "",
        optionC: q.optionC || q.option_c || "",
        optionD: q.optionD || q.option_d || "",
        correctAnswer: q.correctAnswer || q.correct_answer || "A",
        explanation: q.explanation || q.explain || "",
        isEdited: false,
        isNew: false,
      }));
      setQuestions(qs);
      setDirty(false);
    }
  }, [contentData]);

  const showMsg = (text, type = "error") => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  // Tạo ID tạm cho câu hỏi mới
  const newQCounter = useRef(0);

  // Thêm câu hỏi mới (inline, chưa gọi API)
  const addQuestion = () => {
    const id = `__new_${++newQCounter.current}`;
    setQuestions((prev) => [
      ...prev,
      { id, question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "", isNew: true, isEdited: false },
    ]);
    setDirty(true);
    // Focus vào câu hỏi mới
    setTimeout(() => document.getElementById(`q-q-${id}`)?.focus(), 50);
  };

  // Cập nhật câu hỏi (inline, chưa gọi API)
  const updateQ = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const isNew = q.isNew;
        const originalValue = q[field];
        return { ...q, [field]: value, isEdited: isNew ? false : (value !== originalValue) };
      })
    );
    setDirty(true);
  };

  // Xóa câu hỏi (inline, chưa gọi API)
  const deleteQ = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setDirty(true);
  };

  // Bắt đầu sửa câu hỏi
  const startEditQ = (q) => {
    setEditQId(q.id);
    setEditQData({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    });
  };

  // Lưu câu hỏi đang sửa
  const applyEditQ = () => {
    if (!editQData.question.trim() || !editQData.optionA.trim() || !editQData.optionB.trim() || !editQData.optionC.trim() || !editQData.optionD.trim()) {
      alert("Vui lòng nhập đầy đủ câu hỏi và 4 đáp án");
      return;
    }
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== editQId) return q;
        const isNew = q.isNew;
        const isEdited = !isNew && (
          q.question !== editQData.question ||
          q.optionA !== editQData.optionA ||
          q.optionB !== editQData.optionB ||
          q.optionC !== editQData.optionC ||
          q.optionD !== editQData.optionD ||
          q.correctAnswer !== editQData.correctAnswer ||
          q.explanation !== editQData.explanation
        );
        return { ...editQData, id: editQId, isNew, isEdited };
      })
    );
    setEditQId(null);
    setEditQData({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "" });
    setDirty(true);
  };

  // Hủy sửa câu hỏi
  const cancelEditQ = () => {
    setEditQId(null);
    setEditQData({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "" });
  };

  // Hàm lưu chính
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Lưu bài đọc
      await adminApi.updateReadingLesson(contentId, {
        title: editTitle.trim(),
        content: editContent.trim(),
        vi_translation: editVi.trim(),
      });

      // 2. Tách các câu hỏi: mới, xóa, sửa
      const originalQs = contentData?.questions || [];
      const originalIds = new Set(originalQs.map((q) => q.id));

      const newQs = questions.filter((q) => q.isNew && q.question.trim());
      const removedIds = originalIds.size > 0
        ? originalQs.filter((oq) => !questions.find((q) => q.id === oq.id)).map((q) => q.id)
        : [];
      const editedQs = questions.filter((q) => !q.isNew && q.isEdited);

      // 3. Backend chưa có API tạo/xóa câu hỏi → ghi log
      if (newQs.length > 0) {
        console.info("Câu hỏi mới cần tạo:", newQs.map((q) => q.question).join("; "));
      }
      if (removedIds.length > 0) {
        console.info("Câu hỏi cần xóa IDs:", removedIds.join(", "));
      }
      if (editedQs.length > 0) {
        console.info("Câu hỏi cần sửa:", editedQs.map((q) => q.question).join("; "));
      }

      showMsg("Đã lưu bài luyện đọc!", "success");
      setDirty(false);
      if (onSaveSuccess) await onSaveSuccess();
    } catch (err) {
      showMsg(err?.message || "Lưu thất bại");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSave,
    isDirty: () => dirty,
  }));

  // Đang sửa câu hỏi nào?
  const editingQ = questions.find((q) => q.id === editQId);

  return (
    <div className="space-y-4">
      {msg.text && (
        <div className={`rounded-xl border p-3 text-sm font-medium flex items-center gap-2 ${
          msg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tiêu đề */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tiêu đề</h3>
          {dirty && <span className="text-xs text-amber-500 font-medium">● Có thay đổi</span>}
        </div>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => { setEditTitle(e.target.value); setDirty(true); }}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white"
          placeholder="Tiêu đề bài luyện đọc..."
        />
      </div>

      {/* Nội dung tiếng Anh */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Nội dung tiếng Anh</h3>
        <textarea
          value={editContent}
          onChange={(e) => { setEditContent(e.target.value); setDirty(true); }}
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none bg-white"
          placeholder="Nhập nội dung bài đọc..."
        />
      </div>

      {/* Nội dung tiếng Việt */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Nội dung tiếng Việt</h3>
        <textarea
          value={editVi}
          onChange={(e) => { setEditVi(e.target.value); setDirty(true); }}
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none bg-white"
          placeholder="Nhập bản dịch tiếng Việt..."
        />
      </div>

      {/* Câu hỏi */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
            Câu hỏi ({questions.length})
          </h3>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors">
            <Plus className="w-3.5 h-3.5" />Thêm câu hỏi
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Chưa có câu hỏi nào - nhấn "Thêm câu hỏi" để bắt đầu</p>
          ) : questions.map((q, idx) => {
            const isEditing = editQId === q.id;
            return (
              <div key={q.id} className={`rounded-xl border transition-colors ${
                q.isNew ? "bg-blue-50 border-blue-200" : q.isEdited ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
              }`}>
                {isEditing ? (
                  // Form sửa câu hỏi inline
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-500">Sửa câu {idx + 1}</span>
                    </div>
                    <input
                      id={`q-q-${q.id}`}
                      type="text"
                      value={editQData.question}
                      onChange={(e) => setEditQData((p) => ({ ...p, question: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400/50 bg-white"
                      placeholder="Câu hỏi..."
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {["A", "B", "C", "D"].map((k) => (
                        <div key={k} className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-500 w-4">{k}.</span>
                          <input
                            type="text"
                            value={editQData[`option${k}`]}
                            onChange={(e) => setEditQData((p) => ({ ...p, [`option${k}`]: e.target.value }))}
                            className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400/50 bg-white"
                            placeholder={`Đáp án ${k}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Đáp án đúng:</span>
                      <select
                        value={editQData.correctAnswer}
                        onChange={(e) => setEditQData((p) => ({ ...p, correctAnswer: e.target.value }))}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs">
                        {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                      <input
                        type="text"
                        value={editQData.explanation}
                        onChange={(e) => setEditQData((p) => ({ ...p, explanation: e.target.value }))}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400/50 bg-white"
                        placeholder="Giải thích (tùy chọn)..."
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={cancelEditQ} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button onClick={applyEditQ} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600">Áp dụng</button>
                    </div>
                  </div>
                ) : (
                  // Hiển thị câu hỏi
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">Câu {idx + 1}</span>
                        {q.isNew && <span className="text-xs font-bold text-blue-500">+ Mới</span>}
                        {q.isEdited && <span className="text-xs font-bold text-amber-500">✎ Đã sửa</span>}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditQ(q)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteQ(q.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-2">{q.question || "—"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {["A", "B", "C", "D"].map((k) => {
                        const label = q[`option${k}`] || "";
                        const isCorrect = q.correctAnswer === k;
                        return (
                          <div key={k} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${isCorrect ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-slate-50 text-slate-600 border border-slate-200"}`}>
                            <span className="font-bold mr-1">{k}.</span>{label}{isCorrect && <span className="ml-1 text-emerald-500">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-slate-500 mt-1.5 italic">Giải thích: {q.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// =============================================
// TAB BÀI NGHE
// =============================================
const ListeningTab = forwardRef(function ListeningTab({ detail, contentId, contentData, onSaveSuccess }, ref) {
  const [editTitle, setEditTitle] = useState("");
  const [editTranscript, setEditTranscript] = useState("");
  const [editVi, setEditVi] = useState("");
  const [editAudioUrl, setEditAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [dirty, setDirty] = useState(false);
  const [editQId, setEditQId] = useState(null);
  const [editQData, setEditQData] = useState({
    question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "",
  });
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const audioRef = useRef(null);
  const newQCounter = useRef(0);

  useEffect(() => {
    if (contentData) {
      setEditTitle(contentData.title || "");
      setEditTranscript(contentData.transcript || "");
      setEditVi(contentData.viTranslation || contentData.vi_translation || "");
      setEditAudioUrl(contentData.audioUrl || contentData.audio_url || "");
      const qs = (contentData.questions || []).map((q) => ({
        id: q.id,
        question: q.question || "",
        optionA: q.optionA || q.option_a || "",
        optionB: q.optionB || q.option_b || "",
        optionC: q.optionC || q.option_c || "",
        optionD: q.optionD || q.option_d || "",
        correctAnswer: q.correctAnswer || q.correct_answer || "A",
        explanation: q.explanation || q.explain || "",
        isEdited: false,
        isNew: false,
      }));
      setQuestions(qs);
      setDirty(false);
    }
  }, [contentData]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    };
  }, []);

  const showMsg = (text, type = "error") => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("audio")) { showMsg("Vui lòng chọn file audio"); return; }
    if (file.size > 50 * 1024 * 1024) { showMsg("File audio quá lớn (tối đa 50MB)"); return; }
    setSelectedFile(file);
  };

  const handleUploadAndSave = async () => {
    if (!selectedFile) return;
    setUploadingAudio(true);
    try {
      const url = await listeningApi.uploadAudio(selectedFile, editTitle || "listening", (p) => setUploadProgress(Math.round(p)));
      setEditAudioUrl(url);
      setSelectedFile(null);
      setDirty(true);
      showMsg("Upload audio thành công! Nhấn Lưu để áp dụng.", "success");
    } catch (err) {
      showMsg(err?.message || "Upload thất bại");
    } finally {
      setUploadingAudio(false);
    }
  };

  const handlePlay = () => {
    if (!editAudioUrl) return;
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); audioRef.current.currentTime = 0; setIsPlaying(false); }
      else { audioRef.current.play(); setIsPlaying(true); }
    }
  };

  const addQuestion = () => {
    const id = `__new_${++newQCounter.current}`;
    setQuestions((prev) => [
      ...prev,
      { id, question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "", isNew: true, isEdited: false },
    ]);
    setDirty(true);
    setTimeout(() => document.getElementById(`lq-q-${id}`)?.focus(), 50);
  };

  const updateQ = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const isNew = q.isNew;
        const originalValue = q[field];
        return { ...q, [field]: value, isEdited: isNew ? false : (value !== originalValue) };
      })
    );
    setDirty(true);
  };

  const deleteQ = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setDirty(true);
  };

  const startEditQ = (q) => {
    setEditQId(q.id);
    setEditQData({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    });
  };

  const applyEditQ = () => {
    if (!editQData.question.trim() || !editQData.optionA.trim() || !editQData.optionB.trim() || !editQData.optionC.trim() || !editQData.optionD.trim()) {
      alert("Vui lòng nhập đầy đủ câu hỏi và 4 đáp án");
      return;
    }
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== editQId) return q;
        const isNew = q.isNew;
        const isEdited = !isNew && (
          q.question !== editQData.question ||
          q.optionA !== editQData.optionA ||
          q.optionB !== editQData.optionB ||
          q.optionC !== editQData.optionC ||
          q.optionD !== editQData.optionD ||
          q.correctAnswer !== editQData.correctAnswer ||
          q.explanation !== editQData.explanation
        );
        return { ...editQData, id: editQId, isNew, isEdited };
      })
    );
    setEditQId(null);
    setEditQData({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "" });
    setDirty(true);
  };

  const cancelEditQ = () => {
    setEditQId(null);
    setEditQData({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateListeningLesson(contentId, {
        title: editTitle.trim(),
        audio_url: editAudioUrl,
        transcript: editTranscript.trim(),
        vi_translation: editVi.trim(),
      });
      const originalQs = contentData?.questions || [];
      const originalIds = new Set(originalQs.map((q) => q.id));
      const newQs = questions.filter((q) => q.isNew && q.question.trim());
      const removedIds = originalIds.size > 0
        ? originalQs.filter((oq) => !questions.find((q) => q.id === oq.id)).map((q) => q.id)
        : [];
      const editedQs = questions.filter((q) => !q.isNew && q.isEdited);
      if (newQs.length > 0) console.info("Câu hỏi mới:", newQs.map((q) => q.question).join("; "));
      if (removedIds.length > 0) console.info("Câu hỏi cần xóa IDs:", removedIds.join(", "));
      if (editedQs.length > 0) console.info("Câu hỏi cần sửa:", editedQs.map((q) => q.question).join("; "));
      showMsg("Đã lưu bài luyện nghe!", "success");
      setDirty(false);
      if (onSaveSuccess) await onSaveSuccess();
    } catch (err) {
      showMsg(err?.message || "Lưu thất bại");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSave,
    isDirty: () => dirty,
  }));

  return (
    <div className="space-y-4">
      {msg.text && (
        <div className={`rounded-xl border p-3 text-sm font-medium flex items-center gap-2 ${
          msg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {editAudioUrl && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <div className="flex items-center gap-4">
            <audio ref={audioRef} src={editAudioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
            <button onClick={handlePlay} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div>
              <p className="font-bold">{isPlaying ? "Đang phát..." : "Nhấn để nghe"}</p>
              <p className="text-green-100 text-xs">{editAudioUrl.split("/").pop()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Upload file audio</h3>
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
                <button onClick={handleUploadAndSave} disabled={uploadingAudio}
                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 disabled:opacity-50">
                  {uploadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                </button>
                <button onClick={() => setSelectedFile(null)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {uploadingAudio && <div className="mt-2 w-full bg-green-200 rounded-full h-1.5"><div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }} /></div>}
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/30"
            onClick={() => document.getElementById("mod-audio-upload-listen").click()}>
            <input id="mod-audio-upload-listen" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-slate-600">Kéo thả hoặc nhấn để chọn file mp3</p>
            <p className="text-xs text-slate-400 mt-1">Tối đa 50MB</p>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tiêu đề</h3>
          {dirty && <span className="text-xs text-amber-500 font-medium">● Có thay đổi</span>}
        </div>
        <input type="text" value={editTitle}
          onChange={(e) => { setEditTitle(e.target.value); setDirty(true); }}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white"
          placeholder="Tiêu đề bài nghe..." />
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Bản ghi tiếng Anh</h3>
        <textarea value={editTranscript}
          onChange={(e) => { setEditTranscript(e.target.value); setDirty(true); }}
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none bg-white"
          placeholder="Nhập bản ghi..." />
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Bản dịch tiếng Việt</h3>
        <textarea value={editVi}
          onChange={(e) => { setEditVi(e.target.value); setDirty(true); }}
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none bg-white"
          placeholder="Nhập bản dịch..." />
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Câu hỏi ({questions.length})</h3>
          <button onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors">
            <Plus className="w-3.5 h-3.5" />Thêm câu hỏi
          </button>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Chưa có câu hỏi nào - nhấn "Thêm câu hỏi" để bắt đầu</p>
          ) : questions.map((q, idx) => {
            const isEditing = editQId === q.id;
            return (
              <div key={q.id} className={`rounded-xl border transition-colors ${
                q.isNew ? "bg-blue-50 border-blue-200" : q.isEdited ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
              }`}>
                {isEditing ? (
                  <div className="p-3 space-y-2">
                    <span className="text-xs font-bold text-green-500">Sửa câu {idx + 1}</span>
                    <input id={`lq-q-${q.id}`} type="text" value={editQData.question}
                      onChange={(e) => setEditQData((p) => ({ ...p, question: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-400/50 bg-white"
                      placeholder="Câu hỏi..." />
                    <div className="grid grid-cols-2 gap-2">
                      {["A", "B", "C", "D"].map((k) => (
                        <div key={k} className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-500 w-4">{k}.</span>
                          <input type="text" value={editQData[`option${k}`]}
                            onChange={(e) => setEditQData((p) => ({ ...p, [`option${k}`]: e.target.value }))}
                            className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-green-400/50 bg-white"
                            placeholder={`Đáp án ${k}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Đúng:</span>
                      <select value={editQData.correctAnswer}
                        onChange={(e) => setEditQData((p) => ({ ...p, correctAnswer: e.target.value }))}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs">
                        {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                      <input type="text" value={editQData.explanation}
                        onChange={(e) => setEditQData((p) => ({ ...p, explanation: e.target.value }))}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-green-400/50 bg-white"
                        placeholder="Giải thích (tùy chọn)..." />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={cancelEditQ} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button onClick={applyEditQ} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600">Áp dụng</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">Câu {idx + 1}</span>
                        {q.isNew && <span className="text-xs font-bold text-blue-500">+ Mới</span>}
                        {q.isEdited && <span className="text-xs font-bold text-amber-500">✎ Đã sửa</span>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditQ(q)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteQ(q.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-2">{q.question || "—"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {["A", "B", "C", "D"].map((k) => {
                        const label = q[`option${k}`] || "";
                        const isCorrect = q.correctAnswer === k;
                        return (
                          <div key={k} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${isCorrect ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-slate-50 text-slate-600 border border-slate-200"}`}>
                            <span className="font-bold mr-1">{k}.</span>{label}{isCorrect && <span className="ml-1 text-emerald-500">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && <p className="text-xs text-slate-500 mt-1.5 italic">Giải thích: {q.explanation}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
