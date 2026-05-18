import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Globe,
  Lock,
  Trash2,
  ChevronRight,
  Heart,
  PencilLine,
  Clock,
} from "lucide-react";
import CreateSetModal from "@/components/client/vocabulary/CreateSetModal";
import EditSetModal from "@/components/client/vocabulary/EditSetModal";
import SetDetail from "@/components/client/vocabulary/SetDetail";
import PracticeHistoryModal from "@/components/client/practice/PracticeHistoryModal";
import { vocabularyApi } from "@/api/client/vocabularyApi";

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
const SET_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-cyan-600",
];

// Backend trả về status dạng "public" / "private" / "req_public" (chữ thường)
// setStatuses: map từ setId -> status (dùng khi backend không trả status)
// defaultStatus: giá trị mặc định cho tab mà backend không trả status (vd: tab "Cộng đồng")
// Tab "Cộng đồng" dùng defaultStatus làm ưu tiên cao nhất vì tất cả bộ từ đều public
const normalizeSetForDisplay = (set, setStatuses = {}, defaultStatus) => {
  let rawStatus;
  if (defaultStatus !== null) {
    // Tab "Cộng đồng": tất cả đều public, dùng defaultStatus
    rawStatus = defaultStatus;
  } else {
    // Tab "Của tôi" / "Yêu thích": ưu tiên status đã fetch, rồi đến status từ API
    rawStatus = setStatuses[set.id] ?? set.status ?? "private";
  }
  return {
    ...set,
    wordCount: set.wordCount ?? set.word_count ?? 0,
    status: rawStatus,
    is_public: rawStatus === "public",
    is_pending: rawStatus === "req_public",
  };
};

// Kiểm tra xem 1 bộ từ có trong danh sách favorites không
const isFavSet = (setId, favorites) =>
  favorites.some((f) => String(f.id) === String(setId));

export default function Vocabulary() {
  const [sets, setSets] = useState([]);
  const [publicSets, setPublicSets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("mine");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const SETS_PER_PAGE = 6;

  // Lưu chi tiết trạng thái (status) cho các bộ từ trong tab "Của tôi"
  // vì endpoint getMySets không trả về status
  const [setStatuses, setSetStatuses] = useState({});
  const fetchStatusesRef = useRef(0);

  // Ref để tránh update state khi component unmount
  const mountedRef = useRef(true);
  // Ref lưu giá trị hiện tại để dùng trong async callback
  const tabRef = useRef(tab);
  const pageRef = useRef(page);
  const searchRef = useRef(search);

  // Cập nhật ref khi state thay đổi
  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { searchRef.current = search; }, [search]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // Load dữ liệu - được gọi mỗi khi tab/page/search thay đổi
  useEffect(() => {
    let cancelled = false;

    const doLoad = async () => {
      setLoading(true);
      setError("");

      try {
        const keyword = search.trim();
        const currentTab = tabRef.current;
        const currentPage = pageRef.current;

        let data;
        if (currentTab === "mine") {
          data = await vocabularyApi.getMySets({
            page: currentPage,
            limit: SETS_PER_PAGE,
            keyword,
          });
          if (cancelled) return;
          const items = data.items || [];
          setSets(items);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || 0);
          setPage(currentPage);

          // Fetch chi tiết từng bộ để lấy status (vì getMySets không trả status)
          const fetchId = ++fetchStatusesRef.current;
          const statuses = {};
          await Promise.all(
            items.map(async (set) => {
              try {
                const detail = await vocabularyApi.getSetById(set.id);
                if (fetchId === fetchStatusesRef.current) {
                  statuses[set.id] = detail.status || "private";
                }
              } catch (_) {}
            })
          );
          if (!cancelled) setSetStatuses(statuses);
        } else if (currentTab === "public") {
          data = await vocabularyApi.getPublicSets({
            page: currentPage,
            limit: SETS_PER_PAGE,
            keyword,
          });
          if (cancelled) return;
          setPublicSets(data.items || []);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || 0);
          setPage(currentPage);
        } else if (currentTab === "favorites") {
          data = await vocabularyApi.getFavorites({
            page: currentPage,
            limit: SETS_PER_PAGE,
            keyword,
          });
          if (cancelled) return;
          const items = data.items || [];
          setFavorites(items);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || 0);
          setPage(currentPage);

          // Fetch chi tiết từng bộ để lấy status (vì getFavorites không trả status)
          const fetchId = ++fetchStatusesRef.current;
          const statuses = {};
          await Promise.all(
            items.map(async (set) => {
              try {
                const detail = await vocabularyApi.getSetById(set.id);
                if (fetchId === fetchStatusesRef.current) {
                  statuses[set.id] = detail.status || "private";
                }
              } catch (_) {}
            })
          );
          if (!cancelled) setSetStatuses((prev) => ({ ...prev, ...statuses }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không thể tải dữ liệu từ vựng");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Debounce: chờ 350ms sau khi tab/search thay đổi mới gọi API
    const timer = setTimeout(doLoad, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, page, search, reloadTrigger]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const toggleFavorite = async (setId, e) => {
    e?.stopPropagation();
    const id = String(setId);
    const isFav = favorites.some((f) => String(f.id) === id);
    try {
      if (isFav) {
        await vocabularyApi.removeFavorite(id);
        // Cập nhật UI ngay lập tức mà không cần reload toàn bộ
        setFavorites((prev) => prev.filter((f) => String(f.id) !== id));
      } else {
        await vocabularyApi.addFavorite(id);
        // Cập nhật UI ngay lập tức mà không cần reload toàn bộ
        setFavorites((prev) => [...prev, { id: setId }]);
      }
    } catch (err) {
      // Nếu gọi API thất bại thì reload để đồng bộ lại
      setReloadTrigger((n) => n + 1);
      setError(err.message || "Không thể cập nhật yêu thích");
    }
  };

  const deleteSet = async (id, e) => {
    e.stopPropagation();
    try {
      await vocabularyApi.deleteSet(id);
      setReloadTrigger((n) => n + 1);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể xóa bộ từ");
    }
  };

  const openEdit = (setItem, e) => {
    e?.stopPropagation();
    setEditingSet(setItem);
    setShowEdit(true);
  };

  const handleSetUpdated = (updatedSet) => {
    // Cập nhật UI ngay lập tức mà không cần reload toàn bộ
    setSets((prev) => prev.map((s) => String(s.id) === String(updatedSet.id) ? { ...s, ...updatedSet } : s));
    setFavorites((prev) => prev.map((s) => String(s.id) === String(updatedSet.id) ? { ...s, ...updatedSet } : s));
    // Cập nhật selectedSet để SetDetail đang mở cũng thấy thay đổi ngay lập tức
    setSelectedSet((prev) => prev && String(prev.id) === String(updatedSet.id) ? { ...prev, ...updatedSet } : prev);
    setShowEdit(false);
    setEditingSet(null);
  };

  const getDisplayed = () => {
    let data = [];
    let statusMap = {};
    let defaultStatus = null;

    if (tab === "mine") {
      data = sets;
      statusMap = setStatuses;
    } else if (tab === "public") {
      data = publicSets;
      defaultStatus = "public";
    } else if (tab === "favorites") {
      data = favorites;
      statusMap = setStatuses;
    }

    return data.map((s) => normalizeSetForDisplay(s, statusMap, defaultStatus));
  };

  const displayed = getDisplayed();

  if (selectedSet) {
    return (
      <SetDetail
        set={selectedSet}
        onBack={() => {
          setSelectedSet(null);
          setReloadTrigger((n) => n + 1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">📚 Từ vựng</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý và học bộ từ vựng của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all"
          >
            <Clock className="w-4 h-4" />
            Lịch sử
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Tạo bộ từ
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Tabs: Của tôi / Cộng đồng / Yêu thích */}
      <div className="flex gap-2 mb-4">
        {[
          ["mine", "Của tôi"],
          ["public", "Cộng đồng"],
          ["favorites", "Yêu thích"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => handleTabChange(val)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
              tab === val
                ? "gradient-primary text-white shadow-md"
                : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {val === "favorites" && (
              <Heart className={`w-3.5 h-3.5 ${tab === val ? "fill-white" : ""}`} />
            )}
            {label}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Tìm kiếm bộ từ vựng..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : displayed.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold">
            {tab === "favorites" ? "Chưa có bộ từ yêu thích" : "Chưa có dữ liệu"}
          </p>
          {tab === "mine" && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 gradient-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90"
            >
              Tạo bộ từ đầu tiên
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((set, i) => {
              const isFav = isFavSet(set.id, favorites);
              return (
                <div
                  key={set.id}
                  onClick={() => setSelectedSet(set)}
                  className="bg-white rounded-2xl p-5 border border-border card-hover cursor-pointer group relative"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${SET_COLORS[i % SET_COLORS.length]} rounded-xl flex items-center justify-center mb-3 shadow-md`}
                  >
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors flex-1 pr-2">
                      {set.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {set.is_ai_generated && (
                        <Sparkles className="w-4 h-4 text-violet-400" />
                      )}
                      {/* Nút tim yêu thích */}
                      <button
                        onClick={(e) => toggleFavorite(set.id, e)}
                        className={`p-1 rounded-lg transition-colors ${
                          isFav
                            ? "text-red-500"
                            : "text-muted-foreground/40 hover:text-red-400"
                        }`}
                        title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
                      >
                        <Heart
                          className={`w-4 h-4 transition-all ${isFav ? "fill-red-500" : ""}`}
                        />
                      </button>
                      {tab === "mine" && (
                        <button
                          onClick={(e) => openEdit(set, e)}
                          className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground/40 hover:text-primary transition-colors"
                          title="Chỉnh sửa bộ từ"
                        >
                          <PencilLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Icon công khai: chỉ hiện Globe khi đã được duyệt public */}
                      {set.is_public ? (
                        <Globe className="w-4 h-4 text-blue-400" title="Đã công khai" />
                      ) : (
                        <Lock
                          className="w-4 h-4 text-muted-foreground/50"
                          title={set.is_pending ? "Chờ xét duyệt" : "Riêng tư"}
                        />
                      )}
                      {tab === "mine" && (
                        <button
                          onClick={(e) => deleteSet(set.id, e)}
                          className="p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {set.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {set.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {set.wordCount || 0} từ
                    </span>
                    {set.level && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[set.level]}`}
                      >
                        {LEVEL_LABELS[set.level]}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              );
            })}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="w-9 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                ←
              </button>
              {(() => {
                const pages = [];
                const maxVisible = 3;
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (page <= 2) {
                    pages.push(1, 2, 3);
                  } else if (page >= totalPages - 1) {
                    pages.push(totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(page - 1, page, page + 1);
                  }
                }
                return pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? "bg-primary text-white"
                        : "border border-border hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="w-9 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                →
              </button>
            </div>
          )}

        </>
      )}

      {showCreate && (
        <CreateSetModal
          onClose={() => setShowCreate(false)}
          onCreated={(s) => {
            setShowCreate(false);
            setSelectedSet(s);
          }}
        />
      )}
      {showEdit && editingSet && (
        <EditSetModal
          set={editingSet}
          onClose={() => {
            setShowEdit(false);
            setEditingSet(null);
          }}
          onUpdated={handleSetUpdated}
        />
      )}
      {showHistory && (
        <PracticeHistoryModal
          type="vocabulary"
          onClose={() => setShowHistory(false)}
          getHistory={vocabularyApi.getPracticeHistory}
          getDetail={vocabularyApi.getPracticeDetail}
        />
      )}
    </div>
  );
}
