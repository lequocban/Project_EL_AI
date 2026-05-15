import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { leaderboardApi } from "@/api/client/leaderboardApi";

// Icons cho top 3
const TOP_ICONS = [Crown, Medal, Medal];

// Màu sắc cho top 3
const TOP_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-slate-300 to-gray-400",
  "from-amber-600 to-orange-500",
];

// Màu nền hàng top 3
const TOP_BG = [
  "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200",
  "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200",
  "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200",
];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await leaderboardApi.getLeaderboard({ page, limit: pagination.limit });
      setLeaderboard(result.leaderboard);
      setCurrentUserRank(result.currentUserRank);
      setPagination((prev) => ({
        ...prev,
        page: result.pagination.page,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (err) {
      setError(err.message || "Không thể tải bảng xếp hạng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
  }, []);

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      fetchLeaderboard(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      fetchLeaderboard(pagination.page + 1);
    }
  };

  // Tính rank thực tế dựa trên page và vị trí trong danh sách
  const getGlobalRank = (index) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Bảng xếp hạng
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top người dùng có điểm luyện tập cao nhất
        </p>
      </div>

      {/* Thông tin thứ hạng của user hiện tại */}
      {currentUserRank && (
        <div className="mb-5 rounded-2xl border border-border bg-gradient-to-r from-violet-50 to-purple-50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Thứ hạng của bạn</p>
            <p className="text-xl font-black text-violet-600">Hạng #{currentUserRank}</p>
          </div>
        </div>
      )}

      {/* Trạng thái loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground font-medium text-sm">Đang tải bảng xếp hạng...</p>
        </div>
      )}

      {/* Trạng thái lỗi */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-600 mb-3">{error}</p>
          <button
            onClick={() => fetchLeaderboard(pagination.page)}
            className="text-sm font-bold text-violet-600 hover:text-violet-700 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Bảng xếp hạng */}
      {!loading && !error && (
        <div>
          {/* Header của bảng - chỉ hiển thị trên md */}
          <div className="hidden md:grid md:grid-cols-[3rem_1fr_6rem_6rem_5rem] gap-3 px-4 py-2 mb-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <div className="text-center">Hạng</div>
            <div>Người dùng</div>
            <div className="text-center">Lượt làm</div>
            <div className="text-center">Điểm TB</div>
            <div className="text-center">Tổng điểm</div>
          </div>

          {/* Danh sách */}
          {leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-foreground font-bold text-lg">Chưa có dữ liệu</p>
              <p className="text-muted-foreground text-sm mt-1">
                Hãy làm bài luyện tập để xuất hiện trên bảng xếp hạng!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((item, index) => {
                const globalRank = getGlobalRank(index);
                const isTop3 = globalRank <= 3;
                const TopIcon = TOP_ICONS[globalRank - 1];

                return (
                  <div
                    key={item.user_id}
                    className={`
                      rounded-2xl border p-4 transition-all duration-200
                      ${isTop3 ? TOP_BG[globalRank - 1] : "bg-white border-border hover:border-violet-200 hover:shadow-sm"}
                    `}
                  >
                    <div className="grid grid-cols-[3rem_1fr_6rem_6rem_5rem] gap-3 items-center">
                      {/* Cột rank */}
                      <div className="flex items-center justify-center">
                        {isTop3 ? (
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${TOP_COLORS[globalRank - 1]} flex items-center justify-center shadow-sm`}>
                            <TopIcon className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="text-sm font-black text-muted-foreground">
                              {globalRank}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cột user */}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {item.user_name}
                        </p>
                      </div>

                      {/* Cột lượt làm - chỉ hiển thị trên md */}
                      <div className="hidden md:block text-center">
                        <p className="text-sm font-bold text-muted-foreground">
                          {item.practice_count}
                        </p>
                      </div>

                      {/* Cột điểm TB - chỉ hiển thị trên md */}
                      <div className="hidden md:block text-center">
                        <p className={`text-sm font-bold ${isTop3 ? "text-amber-600" : "text-violet-600"}`}>
                          {item.avg_score}
                        </p>
                      </div>

                      {/* Cột tổng điểm */}
                      <div className="text-center">
                        <p className={`text-sm font-black ${isTop3 ? "text-amber-600" : "text-violet-600"}`}>
                          {item.score}
                        </p>
                      </div>
                    </div>

                    {/* Hiển thị mobile */}
                    <div className="flex items-center gap-4 mt-2 md:hidden">
                      <span className="text-xs text-muted-foreground">
                        <span className="font-semibold">{item.practice_count}</span> lượt
                      </span>
                      <span className="text-xs text-muted-foreground">
                        TB: <span className="font-semibold text-violet-600">{item.avg_score}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phân trang */}
          {!loading && leaderboard.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={pagination.page <= 1}
                className="w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center hover:border-violet-300 hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Trang {pagination.page}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {pagination.totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages}
                className="w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center hover:border-violet-300 hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
