import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, BookOpen, BookText, Headphones,
  Loader2, Clock, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, AlertTriangle,
  Filter, ArrowUpDown, Eye, X, User,
  ChevronDown,
} from "lucide-react";
import { moderationApi } from "@/api/client/moderationApi";

const PAGE_SIZE = 6;

const TABS = [
  { key: "", label: "Tất cả", icon: ShieldCheck, gradient: "from-violet-500 to-purple-600" },
  { key: "vocabulary_set", label: "Từ vựng", icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
  { key: "reading_lesson", label: "Luyện đọc", icon: BookText, gradient: "from-orange-500 to-amber-500" },
  { key: "listening_lesson", label: "Luyện nghe", icon: Headphones, gradient: "from-green-500 to-teal-500" },
];

const STATUS_CONFIG = {
  pending: { label: "Chờ duyệt", color: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock },
  approved: { label: "Đã duyệt", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle },
  rejected: { label: "Đã từ chối", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Đã từ chối" },
];

const SORT_OPTIONS = [
  { value: "desc", label: "Mới nhất" },
  { value: "asc", label: "Cũ nhất" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

export default function Moderation() {
  const [activeTab, setActiveTab] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await moderationApi.getMyRequests({
        page: currentPage,
        limit: PAGE_SIZE,
        keyword: activeTab,
        sortField: "created_at",
        sortOrder,
        status: statusFilter,
      });
      setItems(data.items || []);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu kiểm duyệt");
      setItems([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, sortOrder, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortOrder, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showStatusDropdown && !e.target.closest(".mod-status-dropdown")) {
        setShowStatusDropdown(false);
      }
      if (showSortDropdown && !e.target.closest(".mod-sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStatusDropdown, showSortDropdown]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const safePage = Math.min(currentPage, totalPages);

  const getContentLabel = (contentType) => {
    const tab = TABS.find((t) => t.key === contentType);
    return tab ? tab.label : contentType || "—";
  };

  const getContentIcon = (contentType) => {
    const tab = TABS.find((t) => t.key === contentType);
    return tab ? tab.icon : ShieldCheck;
  };

  const getContentColor = (contentType) => {
    if (contentType === "vocabulary_set") return "text-blue-500";
    if (contentType === "reading_lesson") return "text-orange-500";
    if (contentType === "listening_lesson") return "text-green-500";
    return "text-violet-500";
  };

  const getStatusLabel = () => {
    const opt = STATUS_OPTIONS.find((o) => o.value === statusFilter);
    return opt ? opt.label : "Tất cả trạng thái";
  };

  const getSortLabel = () => {
    const opt = SORT_OPTIONS.find((o) => o.value === sortOrder);
    return opt ? opt.label : "Sắp xếp";
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setShowStatusDropdown(false);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setShowSortDropdown(false);
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-violet-500" />
            Kiểm duyệt
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Theo dõi trạng thái yêu cầu kiểm duyệt nội dung của bạn
          </p>
        </div>
        {!loading && (
          <div className="text-sm text-muted-foreground font-medium">
            Tổng: {total} yêu cầu
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setStatusFilter(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md`
                  : "bg-white border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Status Filter */}
        <div className="relative mod-status-dropdown">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-xl font-bold text-sm hover:bg-muted transition-all"
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{getStatusLabel()}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
          </button>
          {showStatusDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                    statusFilter === opt.value ? "text-violet-500 bg-violet-50" : "text-foreground"
                  }`}
                >
                  {opt.label}
                  {statusFilter === opt.value && (
                    <span className="ml-auto text-violet-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Filter */}
        <div className="relative mod-sort-dropdown">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-xl font-bold text-sm hover:bg-muted transition-all"
          >
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{getSortLabel()}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute left-0 mt-2 w-36 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                    sortOrder === opt.value ? "text-violet-500 bg-violet-50" : "text-foreground"
                  }`}
                >
                  {opt.label}
                  {sortOrder === opt.value && (
                    <span className="ml-auto text-violet-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="ml-auto rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />{error}
            <button onClick={() => setError("")} className="underline ml-1">Đóng</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Nội dung</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ngày gửi</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16">
                  <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    {statusFilter
                      ? "Không tìm thấy yêu cầu kiểm duyệt nào phù hợp"
                      : "Bạn chưa gửi yêu cầu kiểm duyệt nào"}
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const status = item.status || "pending";
                const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                const Icon = getContentIcon(item.contentType);
                const colorClass = getContentColor(item.contentType);
                const title = item.content?.title || item.contentTitle || "—";
                return (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{title}</div>
                          <div className="text-xs text-muted-foreground">{getContentLabel(item.contentType)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {status !== "pending" && (
                          <button
                            onClick={() => { setSelectedItem(item); setShowDetail(true); }}
                            className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {status === "pending" && (
                          <span className="text-xs text-muted-foreground italic">Đang chờ xử lý</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && items.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="w-9 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
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
                onClick={() => handlePageChange(p)}
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
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="w-9 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedItem && (
        <ModerationDetailModal
          item={selectedItem}
          onClose={() => { setShowDetail(false); setSelectedItem(null); }}
        />
      )}
    </div>
  );
}

function ModerationDetailModal({ item, onClose }) {
  const status = item.status || "pending";
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = getContentIcon(item.contentType);
  const colorClass = getContentColor(item.contentType);
  const title = item.content?.title || item.contentTitle || "—";
  const description = item.content?.description || "";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-xl bg-muted flex items-center justify-center ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chi tiết kiểm duyệt
              </span>
            </div>
            <h2 className="text-lg font-black text-foreground mt-1">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
              <cfg.icon className="w-3 h-3" />{cfg.label}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted border border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Loại nội dung</p>
              <p className="text-sm font-bold text-foreground">
                {item.contentType === "vocabulary_set" ? "Bộ từ vựng" :
                 item.contentType === "reading_lesson" ? "Bài luyện đọc" :
                 item.contentType === "listening_lesson" ? "Bài luyện nghe" : item.contentType || "—"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted border border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Ngày gửi</p>
              <p className="text-sm font-bold text-foreground">{formatDate(item.createdAt)}</p>
            </div>
            {item.reviewedAt && (
              <div className="p-3 rounded-xl bg-muted border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Ngày xử lý</p>
                <p className="text-sm font-bold text-foreground">{formatDate(item.reviewedAt)}</p>
              </div>
            )}
            {item.reviewedBy && (
              <div className="p-3 rounded-xl bg-muted border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Người duyệt</p>
                <p className="text-sm font-bold text-foreground flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.reviewedByName || "—"}
                </p>
              </div>
            )}
          </div>

          {/* Lý do */}
          {item.reason && (
            <div className="p-4 rounded-xl border border-border bg-muted">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {status === "rejected" ? "Lý do từ chối" : "Lý do"}
              </p>
              <p className="text-sm font-medium text-foreground">{item.reason}</p>
            </div>
          )}

          {/* Ghi chú */}
          {item.notes && (
            <div className="p-4 rounded-xl border border-border bg-muted">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Ghi chú</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}

          {!item.reason && !item.notes && (
            <div className="text-center py-8">
              <ShieldCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Không có thông tin bổ sung</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-bold text-sm hover:bg-muted transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function getContentIcon(contentType) {
  if (contentType === "vocabulary_set") return BookOpen;
  if (contentType === "reading_lesson") return BookText;
  if (contentType === "listening_lesson") return Headphones;
  return ShieldCheck;
}

function getContentColor(contentType) {
  if (contentType === "vocabulary_set") return "text-blue-500";
  if (contentType === "reading_lesson") return "text-orange-500";
  if (contentType === "listening_lesson") return "text-green-500";
  return "text-violet-500";
}
