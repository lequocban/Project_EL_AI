import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  ListChecks,
  Keyboard,
  Volume2,
  Languages,
  PencilLine,
  Mic,
  Headphones,
  ChevronDown,
  SortAsc,
  Search,
  Globe,
  Loader2,
  Eye,
  Clock,
  Settings,
  X,
  Lock,
  Heart,
} from "lucide-react";
import { vocabularyApi } from "@/api/client/vocabularyApi";
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

const MODES = [
  {
    id: "flashcard",
    label: "Flashcard",
    icon: Layers,
    color: "from-violet-500 to-indigo-500",
    emoji: "🃏",
  },
  {
    id: "match",
    label: "Nối từ",
    icon: ListChecks,
    color: "from-blue-500 to-cyan-500",
    emoji: "🔗",
  },
  {
    id: "quiz",
    label: "Trắc nghiệm",
    icon: BookOpen,
    color: "from-green-500 to-teal-500",
    emoji: "📝",
  },
  {
    id: "typing",
    label: "Gõ từ",
    icon: Keyboard,
    color: "from-orange-500 to-amber-500",
    emoji: "⌨️",
  },
  {
    id: "dictation",
    label: "Nghe viết",
    icon: Headphones,
    color: "from-pink-500 to-rose-500",
    emoji: "🎧",
  },
];

// Component chi tiết bộ từ vựng với các chế độ học tập và quản lý từ
export default function SetDetail({ set, onBack, favorites = [], onToggleFavorite, moderationStatus = null, onModerationStatusChange }) {
  const [allWords, setAllWords] = useState([]);
  const [words, setWords] = useState([]);
  const [showAddWord, setShowAddWord] = useState(false);
  // Mỗi phần tử: { word, meaning, pronunciation, isLoading }
  const [pendingWords, setPendingWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Id của từ đang được phát âm (để hiện icon loading/spinning)
  const [speakingId, setSpeakingId] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // Phân trang từ vựng: chỉ dùng để hiển thị
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wordsPagination, setWordsPagination] = useState({});
  // Tìm kiếm từ vựng cục bộ (filter phía client vì backend không hỗ trợ search từ)
  const [searchQuery, setSearchQuery] = useState("");
  // Loading state riêng cho việc tải từ vựng (để hiện spinner khi chuyển trang)
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  // Track nếu đang trong chế độ search (load nhiều dữ liệu để filter phía client)
  const [isSearchMode, setIsSearchMode] = useState(false);
  const navigate = useNavigate();

  // State cho việc gửi yêu cầu công khai / chuyển riêng tư
  const [isRequestingPublic, setIsRequestingPublic] = useState(false);
  const [isMakingPrivate, setIsMakingPrivate] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showModerationDialog, setShowModerationDialog] = useState(false);

  // State cho dialog Setting
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settingsTab, setSettingsTab] = useState("visibility"); // "visibility" | "edit"
  const [visibilityMode, setVisibilityMode] = useState("private");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất", sortField: "created_at", sortOrder: "desc" },
    { value: "oldest", label: "Cũ nhất", sortField: "created_at", sortOrder: "asc" },
    { value: "az", label: "A → Z", sortField: "word", sortOrder: "asc" },
    { value: "za", label: "Z → A", sortField: "word", sortOrder: "desc" },
  ];

  // Số từ mỗi trang hiển thị
  const WORDS_PER_PAGE = 7;

  // Lấy nhãn sắp xếp hiện tại
  const getCurrentSortLabel = () => {
    const opt = SORT_OPTIONS.find((o) => o.value === sortOption);
    return opt ? opt.label : "Sắp xếp";
  };

  // Tính words hiển thị theo trang từ allWords
  // Tính danh sách từ hiển thị theo trang
  const calculateDisplayWords = (wordsList, page) => {
    const startIndex = (page - 1) * WORDS_PER_PAGE;
    return wordsList.slice(startIndex, startIndex + WORDS_PER_PAGE);
  };

  // Tính totalPages từ số từ
  // Tính tổng số trang từ tổng số từ
  const calculateTotalPages = (totalWords) => {
    return Math.max(1, Math.ceil(totalWords / WORDS_PER_PAGE));
  };

  // Load tất cả từ từ backend để dùng cho game và luyện tập
  // Tải tất cả từ từ backend cho game và luyện tập
  const fetchAllWords = async (sortField, sortOrder) => {
    try {
      setIsLoadingWords(true);
      const detail = await vocabularyApi.getSetById(set.id, {
        page: 1,
        limit: 500, // Load nhiều từ để đủ cho game
        sortField,
        sortOrder,
      });

      const fetchedWords = detail.words || [];
      const pagination = detail.wordsPagination || {};
      const total = pagination.total || fetchedWords.length;

      // Nếu tổng số từ lớn hơn limit, cần load thêm
      if (total > 500) {
        // Load thêm các trang còn lại
        const totalPagesNeeded = Math.ceil(total / 500);
        let allFetchedWords = [...fetchedWords];

        for (let page = 2; page <= totalPagesNeeded; page++) {
          const pageDetail = await vocabularyApi.getSetById(set.id, {
            page,
            limit: 500,
            sortField,
            sortOrder,
          });
          allFetchedWords = [...allFetchedWords, ...(pageDetail.words || [])];
        }

        setAllWords(allFetchedWords);
        setWordsPagination(pagination);
        setTotalPages(calculateTotalPages(total));
        setWords(calculateDisplayWords(allFetchedWords, currentPage));
      } else {
        // Đủ dữ liệu, không cần load thêm
        setAllWords(fetchedWords);
        setWordsPagination(pagination);
        setTotalPages(calculateTotalPages(total));
        setWords(calculateDisplayWords(fetchedWords, currentPage));
      }

      setError("");
    } catch (err) {
      setAllWords([]);
      setWords([]);
      setTotalPages(1);
      setError(err.message || "Không thể tải danh sách từ");
    } finally {
      setIsLoadingWords(false);
    }
  };

  // Load nhiều từ để search phía client
  // Tải nhiều từ để search phía client
  const fetchAllWordsForSearch = async (sortField, sortOrder) => {
    try {
      setIsLoadingWords(true);
      const detail = await vocabularyApi.getSetById(set.id, {
        page: 1,
        limit: 500,
        sortField,
        sortOrder,
      });

      const fetchedWords = detail.words || [];
      const pagination = detail.wordsPagination || {};
      const total = pagination.total || fetchedWords.length;

      setAllWords(fetchedWords);
      setWordsPagination(pagination);
      setTotalPages(calculateTotalPages(total));
      setWords(calculateDisplayWords(fetchedWords, 1));
      setError("");
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoadingWords(false);
    }
  };

  // Load tất cả từ khi vào trang hoặc khi sort thay đổi
  useEffect(() => {
    if (isSearchMode) return;
    const opt = SORT_OPTIONS.find((o) => o.value === sortOption);
    fetchAllWords(opt?.sortField || "word", opt?.sortOrder || "asc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set.id, sortOption]);

  // Xử lý search thay đổi
  useEffect(() => {
    setCurrentPage(1);
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      const opt = SORT_OPTIONS.find((o) => o.value === sortOption);
      fetchAllWordsForSearch(opt?.sortField || "word", opt?.sortOrder || "asc");
    } else {
      setIsSearchMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Cập nhật words hiển thị khi currentPage thay đổi (không gọi API)
  useEffect(() => {
    if (!isSearchMode) {
      setWords(calculateDisplayWords(allWords, currentPage));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, allWords, isSearchMode]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest(".sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown]);

  // Thêm một ô nhập từ mới vào danh sách chờ
  // Thêm một ô nhập từ mới vào danh sách chờ
  const addWordField = () => {
    setPendingWords((current) => [
      ...current,
      { word: "", meaning: "", pronunciation: "", isLoading: false },
    ]);
  };

  // Cập nhật từ tiếng Anh trong ô chờ, tự động tra cứu nghĩa khi có từ
  // Cập nhật từ trong ô chờ và tự động tra cứu nghĩa
  const updatePendingWord = async (index, field, value) => {
    setPendingWords((current) => {
      const updated = [...current];
      updated[index] = { ...updated[index], [field]: value };

      // Khi từ tiếng Anh thay đổi và có nội dung, tự động tra cứu
      if (field === "word" && value.trim()) {
        updated[index].isLoading = true;
        updated[index].meaning = "";
        updated[index].pronunciation = "";
      } else if (field === "word" && !value.trim()) {
        // Xóa trắng từ thì reset thông tin
        updated[index].meaning = "";
        updated[index].pronunciation = "";
        updated[index].isLoading = false;
      }

      return updated;
    });

    // Gọi API tra cứu nếu từ tiếng Anh được nhập
    if (field === "word" && value.trim()) {
      try {
        const lookedUp = await vocabularyApi.lookupWord(value.trim());
        setPendingWords((current) => {
          const updated = [...current];
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              meaning: lookedUp.meaning || "",
              pronunciation: lookedUp.pronunciation || "",
              isLoading: false,
            };
          }
          return updated;
        });
      } catch {
        setPendingWords((current) => {
          const updated = [...current];
          if (updated[index]) {
            updated[index].isLoading = false;
          }
          return updated;
        });
      }
    }
  };

  // Xóa một ô nhập từ khỏi danh sách chờ
  // Xóa một ô nhập từ khỏi danh sách chờ
  const removePendingWord = (index) => {
    setPendingWords((current) => current.filter((_, i) => i !== index));
  };

  // Lưu tất cả từ đã tra cứu vào bộ từ vựng
  // Lưu tất cả từ đã nhập vào bộ từ vựng
  const saveAllWords = async () => {
    // Lọc ra các từ có nghĩa hợp lệ
    const validWords = pendingWords
      .filter((w) => w.word.trim() && w.meaning.trim())
      .map((w) => w.word.trim());

    if (validWords.length === 0) return;

    try {
      setLoading(true);
      // Gửi tất cả từ cùng lúc
      await vocabularyApi.addWordsToSet(set.id, validWords);
      // Reset trạng thái
      setPendingWords([]);
      setShowAddWord(false);
      // Reset về trang 1 sau khi thêm
      setCurrentPage(1);
      // Load lại tất cả từ
      const opt = SORT_OPTIONS.find((o) => o.value === sortOption);
      await fetchAllWords(opt?.sortField || "word", opt?.sortOrder || "asc");
      setError("");
    } catch (err) {
      setError(err.message || "Không thể thêm từ");
    } finally {
      setLoading(false);
    }
  };

  // Đóng phần thêm từ và xóa toàn bộ ô chờ
  // Đóng phần thêm từ và xóa toàn bộ ô chờ
  const cancelAddWords = () => {
    setPendingWords([]);
    setShowAddWord(false);
  };

  // Xóa một từ khỏi bộ từ vựng
  const deleteWord = async (id) => {
    try {
      await vocabularyApi.deleteWordsFromSet(set.id, [id]);
      // Xóa từ khỏi cả allWords và words
      const newAllWords = allWords.filter((w) => w.id !== id);
      const newTotalPages = calculateTotalPages(newAllWords.length);
      // Đảm bảo currentPage không vượt quá totalPages mới
      const newCurrentPage = Math.min(currentPage, Math.max(1, newTotalPages));

      setAllWords(newAllWords);
      setTotalPages(newTotalPages);
      setCurrentPage(newCurrentPage);
      setWords(calculateDisplayWords(newAllWords, newCurrentPage));
      setError("");
    } catch (err) {
      setError(err.message || "Không thể xóa từ");
    }
  };

  // Gửi yêu cầu kiểm duyệt (dùng endpoint moderation-requests chung)
  // Gửi yêu cầu kiểm duyệt bộ từ vựng
  const handleConfirmModeration = async () => {
    setShowModerationDialog(false);
    try {
      setIsRequestingPublic(true);
      setActionMessage("");
      await vocabularyApi.requestModeration(set.id);
      setActionMessage("Đã gửi yêu cầu kiểm duyệt! Admin sẽ xem xét và phản hồi.");
      // Cập nhật trạng thái thành pending
      if (typeof onModerationStatusChange === "function") {
        onModerationStatusChange("pending");
      }
    } catch (err) {
      setActionMessage(`Lỗi: ${err.message || "Không thể gửi yêu cầu kiểm duyệt"}`);
      setIsRequestingPublic(false);
    }
  };

  // Chuyển bộ từ vựng về chế độ riêng tư
  // Chuyển bộ từ vựng về chế độ riêng tư
  const handleMakePrivate = async () => {
    if (!window.confirm("Bạn có muốn chuyển bộ từ vựng này về chế độ riêng tư không?")) {
      return;
    }
    try {
      setIsMakingPrivate(true);
      setActionMessage("");
      await vocabularyApi.makePrivate(set.id);
      setActionMessage("Đã chuyển bộ từ vựng về chế độ riêng tư.");
      // Reload lại trang để cập nhật trạng thái
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setActionMessage(`Lỗi: ${err.message || "Không thể chuyển về chế độ riêng tư"}`);
    } finally {
      setIsMakingPrivate(false);
    }
  };

  // Xử lý thay đổi visibility trong dialog Setting (chỉ cho req_public)
  const handleVisibilitySubmit = async () => {
    setSettingsError("");
    setSettingsSuccess("");
    try {
      if (visibilityMode === "req_public") {
        setIsRequestingPublic(true);
        await vocabularyApi.requestPublic(set.id);
        setSettingsSuccess("Đã gửi yêu cầu công khai! Nội dung sẽ được kiểm duyệt.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setSettingsError(err.message || "Không thể thực hiện thao tác");
    } finally {
      setIsRequestingPublic(false);
    }
  };

  // Xác nhận chuyển về riêng tư (từ public hoặc req_public)
  const handleConfirmPrivate = async () => {
    setSettingsError("");
    setSettingsSuccess("");
    try {
      setIsMakingPrivate(true);
      await vocabularyApi.makePrivate(set.id);
      // Xoá yêu cầu kiểm duyệt đang chờ (nếu có)
      try {
        const modData = await vocabularyApi.getMyModerationRequests({ limit: 50 });
        const relatedRequest = modData.items.find(
          (req) => String(req.contentId) === String(set.id)
        );
        if (relatedRequest) {
          await vocabularyApi.deleteModerationRequest(relatedRequest.id);
        }
      } catch {
        // Không sao nếu không xoá được moderation request
      }
      setSettingsSuccess("Đã chuyển về chế độ riêng tư.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setSettingsError(err.message || "Không thể chuyển về chế độ riêng tư");
    } finally {
      setIsMakingPrivate(false);
    }
  };

  // Xử lý lưu chỉnh sửa trong dialog Setting
  const handleEditSubmit = async () => {
    if (!editTitle.trim()) {
      setSettingsError("Vui lòng nhập tên bộ từ vựng");
      return;
    }
    setSettingsError("");
    setSettingsSuccess("");
    try {
      setIsSaving(true);
      const updated = await vocabularyApi.updateSet(set.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setSettingsSuccess("Đã lưu thay đổi thành công.");
      setTimeout(() => {
        setShowSettingsDialog(false);
        // Reload để cập nhật trạng thái
        window.location.reload();
      }, 800);
    } catch (err) {
      setSettingsError(err.message || "Không thể cập nhật bộ từ vựng");
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý xoá bộ từ trong dialog Setting
  const handleDeleteSet = async () => {
    if (!window.confirm("Bạn có chắc muốn xoá bộ từ vựng này không? Hành động này không thể hoàn tác.")) {
      return;
    }
    setSettingsError("");
    try {
      setIsDeleting(true);
      await vocabularyApi.deleteSet(set.id);
      setShowSettingsDialog(false);
      // Quay về danh sách
      onBack();
    } catch (err) {
      setSettingsError(err.message || "Không thể xoá bộ từ vựng");
    } finally {
      setIsDeleting(false);
    }
  };

  // Mở dialog Setting
  const openSettingsDialog = () => {
    setSettingsTab("visibility");
    setVisibilityMode(set?.status || "private");
    setEditTitle(set?.title || "");
    setEditDescription(set?.description || "");
    setSettingsError("");
    setSettingsSuccess("");
    setTimeout(() => setShowSettingsDialog(true), 0);
  };

  // Phát âm từ vựng. Nếu từ chưa có audioUrl thì gọi lookup để lấy từ backend.
  // Phát âm từ vựng qua audio URL hoặc SpeechSynthesis
  const playAudio = async (word) => {
    // Nếu đang phát từ này rồi thì dừng
    if (speakingId === word.id) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis?.cancel();
    setSpeakingId(word.id);
    try {
      let audioUrl = word.audioUrl;
      if (!audioUrl) {
        const lookedUp = await vocabularyApi.lookupWord(word.word);
        audioUrl = lookedUp.audioUrl;
      }
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => setSpeakingId(null);
        audio.play();
      } else {
        setSpeakingId(null);
      }
    } catch {
      setSpeakingId(null);
    }
  };

  // Sắp xếp đã được xử lý phía backend qua API
  // words state đã chứa dữ liệu đã sắp xếp từ API

  // Load đủ từ rồi bắt đầu game
  // Bắt đầu chế độ chơi game sau khi đảm bảo đủ từ
  const startGame = async (modeId) => {
    navigate(`/vocabulary/${set.id}/practice/${modeId}`);
  };

  const startExam = async (type) => {
    navigate(`/vocabulary/${set.id}/practice/exam-${type}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-foreground">{set.title}</h1>
            {set.description && (
              <p className="text-muted-foreground text-sm mt-1">{set.description}</p>
            )}
            <p className="text-sm font-semibold text-primary mt-1">{(wordsPagination.total || words.length)} từ vựng</p>
          </div>
          {/* Các nút Yêu thích, Trạng thái và Setting */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Nút yêu thích - luôn hiển thị */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(set.id)}
                disabled={isTogglingFavorite}
                className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                  Array.isArray(favorites) && favorites.some((f) => String(f.id) === String(set.id))
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-muted-foreground/60 hover:text-red-400 hover:bg-red-50"
                }`}
                title={Array.isArray(favorites) && favorites.some((f) => String(f.id) === String(set.id)) ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Heart className={`w-5 h-5 ${Array.isArray(favorites) && favorites.some((f) => String(f.id) === String(set.id)) ? "fill-red-500" : ""}`} />
              </button>
            )}
            {/* Trạng thái - luôn hiển thị */}
            {set.status === "public" ? (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-2 rounded-xl text-sm font-bold border border-green-200">
                <Globe className="w-4 h-4" />
                Công khai
              </span>
            ) : set.status === "req_public" ? (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-2 rounded-xl text-sm font-bold border border-amber-200">
                <Clock className="w-4 h-4" />
                Chờ duyệt
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-2 rounded-xl text-sm font-bold border border-gray-200">
                <Lock className="w-4 h-4" />
                Riêng tư
              </span>
            )}
            {/* Nút kiểm duyệt */}
            {!set.is_public && (
              (moderationStatus === "approved" || moderationStatus === "rejected") ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isMakingPrivate || isRequestingPublic}
                      className="flex items-center gap-1.5 bg-violet-50 text-violet-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-violet-100 transition-all border border-violet-200 disabled:opacity-50"
                      title="Gửi lại yêu cầu kiểm duyệt"
                    >
                      {isRequestingPublic ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      Gửi lại yêu cầu
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận gửi lại yêu cầu kiểm duyệt</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có muốn gửi lại yêu cầu kiểm duyệt cho bộ từ vựng này không? Yêu cầu mới sẽ được hiển thị trên trang Kiểm duyệt của admin.
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
                          "Gửi lại yêu cầu"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : moderationStatus !== "pending" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isMakingPrivate || isRequestingPublic}
                      className="flex items-center gap-1.5 bg-violet-50 text-violet-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-violet-100 transition-all border border-violet-200 disabled:opacity-50"
                      title="Gửi yêu cầu kiểm duyệt"
                    >
                      {isRequestingPublic ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      Kiểm duyệt
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận gửi yêu cầu kiểm duyệt</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có muốn gửi yêu cầu kiểm duyệt cho bộ từ vựng này không? Yêu cầu sẽ được hiển thị trên trang Kiểm duyệt của admin.
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
              ) : null
            )}
            <button
              onClick={openSettingsDialog}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all border border-gray-200"
              title="Cài đặt bộ từ"
            >
              <Settings className="w-4 h-4" />
              Setting
            </button>
          </div>
        </div>
        {actionMessage && (
          <div className={`mt-3 rounded-xl p-3 text-sm font-medium ${
            actionMessage.includes("Lỗi")
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}>
            {actionMessage}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {allWords.length >= 4 && (
        <div className="mb-8">
          <h2 className="text-base font-black text-foreground mb-3">Luyện tập</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => startGame(m.id)}
                className={`bg-gradient-to-br ${m.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-bold text-sm">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {allWords.length < 4 && allWords.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-medium">
          ⚠️ Cần ít nhất 4 từ để bắt đầu luyện tập. Hãy thêm thêm từ vựng!
        </div>
      )}

      {allWords.length >= 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-foreground">Kiểm tra</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Làm hết bài rồi bấm nộp để biết kết quả
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => startExam("quiz")}
              className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <Languages className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Quiz</span>
              <span className="text-xs text-white/70">EN → VI</span>
            </button>
            <button
              onClick={() => startExam("listening_quiz")}
              className="bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <Headphones className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Listening quiz</span>
              <span className="text-xs text-white/70">Nghe → VI</span>
            </button>
            <button
              onClick={() => startExam("translate_write")}
              className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <PencilLine className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Translate write</span>
              <span className="text-xs text-white/70">VI → EN</span>
            </button>
            <button
              onClick={() => startExam("listening_write")}
              className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <Mic className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Listening write</span>
              <span className="text-xs text-white/70">Nghe → EN</span>
            </button>
          </div>
        </div>
      )}

      {/* Ô tìm kiếm từ vựng */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
            }}
            placeholder="Tìm kiếm từ vựng..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-foreground">Danh sách từ</h2>
        <div className="flex items-center gap-2">
          <div className="relative sort-dropdown">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-xl font-bold text-sm hover:bg-muted transition-all"
            >
              <SortAsc className="w-4 h-4 text-primary" />
              <span className="text-foreground">{getCurrentSortLabel()}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={async () => {
                      if (sortOption === opt.value) {
                        setShowSortDropdown(false);
                        return;
                      }
                      setShowSortDropdown(false);
                      setSortOption(opt.value);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                      sortOption === opt.value ? "text-primary bg-primary/5" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                    {sortOption === opt.value && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (!showAddWord) {
                setPendingWords([{ word: "", meaning: "", pronunciation: "", example: "", part_of_speech: "", isLoading: false }]);
              }
              setShowAddWord(true);
            }}
            disabled={set.is_public}
            className={`flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-all ${
              set.is_public ? "opacity-40 cursor-not-allowed pointer-events-none" : ""
            }`}
          >
            <Plus className="w-4 h-4" /> Thêm từ
          </button>
        </div>
      </div>

      {showAddWord && !set.is_public && (
        <div className="bg-white border border-border rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-muted-foreground">
              Nhập từ tiếng Anh — nghĩa và âm vị sẽ tự động tra cứu
            </span>
            <span className="text-xs text-muted-foreground">
              {pendingWords.filter((w) => w.word.trim() && w.meaning.trim()).length} / {pendingWords.length} từ hợp lệ
            </span>
          </div>

          {pendingWords.map((item, index) => (
            <div key={index} className="relative">
              {/* Nút xóa từng ô */}
              <button
                onClick={() => removePendingWord(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors z-10"
                title="Xóa ô này"
              >
                <span className="text-xs font-bold">×</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    value={item.word}
                    onChange={(e) => updatePendingWord(index, "word", e.target.value)}
                    placeholder="Từ tiếng Anh"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                  />
                  {item.isLoading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  value={item.pronunciation}
                  onChange={(e) => updatePendingWord(index, "pronunciation", e.target.value)}
                  placeholder="/phiên âm/"
                  className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <input
                value={item.meaning}
                onChange={(e) => updatePendingWord(index, "meaning", e.target.value)}
                placeholder="Nghĩa tiếng Việt"
                className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-3"
              />
              {/* Thông tin đã tra cứu */}
              {item.word.trim() && item.meaning && (
                <div className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                  <span>✓</span> Đã tra cứu: <strong>{item.word}</strong> — {item.meaning}
                </div>
              )}
              {item.word.trim() && !item.meaning && !item.isLoading && (
                <div className="mt-1 text-xs text-amber-600 font-medium flex items-center gap-1">
                  <span>⚠</span> Nghĩa trống — từ này sẽ không được thêm
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={addWordField}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border font-bold text-sm hover:bg-muted transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm ô nhập
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={cancelAddWords}
              className="px-4 py-2 rounded-xl border border-border font-bold text-sm hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={saveAllWords}
              disabled={
                loading ||
                pendingWords.filter((w) => w.word.trim() && w.meaning.trim()).length === 0
              }
              className="gradient-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Lưu tất cả ({pendingWords.filter((w) => w.word.trim() && w.meaning.trim()).length})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading && words.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-semibold">Đang tải dữ liệu...</p>
        </div>
      ) : words.length === 0 && !searchQuery ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-muted-foreground font-semibold">Chưa có dữ liệu</p>
        </div>
      ) : isLoadingWords ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {(() => {
            // Lọc từ theo search query (xử lý phía client vì backend không hỗ trợ search từ)
            // Khi search: filter trên allWords rồi slice theo trang
            // Khi không search: dùng words đã được slice sẵn
            const isSearching = !!searchQuery.trim();

            // Tính tổng số trang cho phân trang
            const totalFiltered = totalPages;

            return (
              <>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Tìm thấy {isSearching ? allWords.length : allWords.length} từ trong bộ từ
                  </p>
                )}
                <div className="space-y-2">
                  {words.map((w) => (
                    <div
                      key={w.id}
                      className="bg-white rounded-xl border border-border p-4 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-base">{w.word}</span>
                          {w.pronunciation && (
                            <span className="text-sm text-muted-foreground">/{w.pronunciation}/</span>
                          )}
                          {w.part_of_speech && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                              {w.part_of_speech}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 font-medium">{w.meaning}</p>
                        {w.example && (
                          <p className="text-xs text-muted-foreground/70 mt-1 italic">"{w.example}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={() => playAudio(w)}
                          disabled={speakingId === w.id}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                            speakingId === w.id
                              ? "text-primary bg-primary/15"
                              : "text-primary bg-primary/10 hover:bg-primary/20 hover:shadow-md"
                          }`}
                          title="Phát âm"
                        >
                          {speakingId === w.id ? (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                        {!set.is_public && (
                          <button
                            onClick={() => deleteWord(w.id)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all shadow-sm hover:shadow-md"
                            title="Xóa từ"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
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
                        if (currentPage <= 2) {
                          pages.push(1, 2, 3);
                        } else if (currentPage >= totalPages - 1) {
                          pages.push(totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(currentPage - 1, currentPage, currentPage + 1);
                        }
                      }
                      return pages.map((p) => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            currentPage === p
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
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}

      {/* Dialog Setting */}
      {showSettingsDialog && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setShowSettingsDialog(false)}
        >
          <div style={{ backgroundColor: "white", borderRadius: "1rem", width: "100%", maxWidth: "28rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Cài đặt bộ từ
              </h2>
              <button onClick={() => setShowSettingsDialog(false)} className="p-2 rounded-xl hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setSettingsTab("visibility")}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-all ${
                  settingsTab === "visibility"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Công khai
              </button>
              <button
                onClick={() => setSettingsTab("edit")}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-all ${
                  settingsTab === "edit"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Chỉnh sửa
              </button>
            </div>

            {/* Tab content */}
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
                    Chọn chế độ hiển thị cho bộ từ vựng
                  </p>

                  {/* Radio options */}
                  <div className="space-y-3">
                    {/* Riêng tư */}
                    <div
                      onClick={() => setVisibilityMode("private")}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        visibilityMode === "private"
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-border hover:bg-muted cursor-pointer"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        visibilityMode === "private" ? "border-primary" : "border-muted-foreground/40"
                      }`}>
                        {visibilityMode === "private" && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground">Riêng tư</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Chỉ bạn mới có thể xem bộ từ này
                        </p>
                      </div>
                      <Lock className={`w-4 h-4 ${visibilityMode === "private" ? "text-primary" : "text-muted-foreground/50"}`} />
                    </div>

                    {/* Duyệt công khai */}
                    <div
                      onClick={() => {
                        if (set.status !== "req_public" && set.status !== "public") {
                          setVisibilityMode("req_public");
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        visibilityMode === "req_public"
                          ? "border-amber-400 bg-amber-50"
                          : "border-border hover:bg-muted"
                      } ${set.status === "req_public" || set.status === "public" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        visibilityMode === "req_public" ? "border-amber-500" : "border-muted-foreground/40"
                      }`}>
                        {visibilityMode === "req_public" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground">Duyệt công khai</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Gửi yêu cầu để admin kiểm duyệt trước khi công khai
                        </p>
                      </div>
                      {set.status === "req_public" ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Eye className={`w-4 h-4 ${visibilityMode === "req_public" ? "text-amber-500" : "text-muted-foreground/50"}`} />
                      )}
                    </div>

                    {/* Công khai */}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        set.status === "public"
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
                      <Globe className={`w-4 h-4 ${set.status === "public" ? "text-green-600" : "text-muted-foreground/50"}`} />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowSettingsDialog(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted"
                    >
                      Huỷ
                    </button>
                    {(visibilityMode === "req_public" || (visibilityMode === "private" && (set.status === "public" || set.status === "req_public" || moderationStatus === "pending"))) && (
                      visibilityMode === "req_public" ? (
                        <button
                          onClick={handleVisibilitySubmit}
                          disabled={isRequestingPublic}
                          className="flex-1 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {isRequestingPublic ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            "Gửi yêu cầu"
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleConfirmPrivate}
                          disabled={isMakingPrivate}
                          className="flex-1 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {isMakingPrivate ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            "Xác nhận"
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {settingsTab === "edit" && (
                <div className="space-y-4">
                  {set.status !== "private" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                      Không thể chỉnh sửa khi bộ từ đang ở chế độ công khai hoặc chờ duyệt.
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-bold text-foreground mb-1 block">
                      Tên bộ từ vựng *
                    </label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="VD: Từ vựng về thể thao"
                      disabled={set.status !== "private"}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={set.status !== "private"}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowSettingsDialog(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted"
                    >
                      Huỷ
                    </button>
                    {set.status === "private" && (
                      <>
                        <button
                          onClick={handleDeleteSet}
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
                          className="flex-1 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
