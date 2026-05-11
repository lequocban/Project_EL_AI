import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Headphones,
  FileText,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Target,
} from "lucide-react";
import { statsApi } from "@/api/statsApi";

/**
 * Trang tổng hợp thống kê học tập: điểm trung bình, KPI từng phần, bảng chi tiết.
 */
export default function Stats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const loadDataRef = useRef(null);

  // Gọi API lấy dữ liệu thống kê, quản lý loading/error.
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const result = await statsApi.getLearningStats();
      setData(result);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu thống kê");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  loadDataRef.current = loadData;

  useEffect(() => {
    loadData();
  }, []);

  // Cập nhật ref để handleRefresh có thể gọi loadData với cờ refresh.
  const handleRefresh = () => loadDataRef.current(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="mb-6">
          <div className="h-8 w-48 bg-muted rounded-xl animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border animate-pulse">
              <div className="h-4 w-24 bg-muted rounded-lg mb-3" />
              <div className="h-8 w-16 bg-muted rounded-lg mb-2" />
              <div className="h-3 w-32 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border animate-pulse">
              <div className="h-4 w-32 bg-muted rounded-lg mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-foreground">Thống kê học tập</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Theo dõi tiến trình học tập của bạn
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
          <p className="text-foreground font-bold text-lg mb-1">Tải dữ liệu thất bại</p>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">{error}</p>
          <button
            onClick={() => loadDataRef.current()}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const vocab = data.vocabulary;
  const reading = data.reading;
  const listening = data.listening;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Thống kê học tập
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Theo dõi tiến trình học tập của bạn
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 px-3 py-2 rounded-xl hover:bg-primary/5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Tổng quan điểm trung bình */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <p className="text-pink-200 font-semibold text-sm">Điểm trung bình chung</p>
              <p className="text-5xl font-black leading-none">
                {data.overallAvgScore}
                <span className="text-2xl ml-1">/ 100</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-pink-200 font-semibold text-sm">Tổng buổi luyện tập</p>
            <p className="text-3xl font-black">
              {data.totalPracticeCount}
              <span className="text-base ml-1 font-bold">bài</span>
            </p>
          </div>
        </div>
      </div>

      {/* Top Row: 3 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Từ vựng */}
        <VocabStatsCard data={vocab} />

        {/* Luyện nghe */}
        <ListeningStatsCard data={listening} />

        {/* Luyện đọc */}
        <ReadingStatsCard data={reading} />
      </div>

      {/* Chi tiết từng phần */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
        <p className="text-base font-black text-foreground mb-4">Chi tiết từng phần</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-muted-foreground">Phần</th>
                <th className="text-center py-3 px-4 font-bold text-muted-foreground">Bài sở hữu</th>
                <th className="text-center py-3 px-4 font-bold text-muted-foreground">Đã luyện tập</th>
                <th className="text-center py-3 px-4 font-bold text-muted-foreground">Số bài luyện</th>
                <th className="text-center py-3 px-4 font-bold text-muted-foreground">Điểm TB</th>
              </tr>
            </thead>
            <tbody>
              <StatsRow
                icon={<BookOpen className="w-4 h-4" />}
                iconBg="bg-violet-100"
                iconColor="text-violet-600"
                label="Từ vựng"
                ownedCount={vocab.ownedCount}
                practicedCount={vocab.practicedCount}
                practiceCount={vocab.practiceCount}
                avgScore={vocab.avgScore}
              />
              <StatsRow
                icon={<Headphones className="w-4 h-4" />}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                label="Luyện nghe"
                ownedCount={listening.ownedCount}
                practicedCount={listening.practicedCount}
                practiceCount={listening.practiceCount}
                avgScore={listening.avgScore}
              />
              <StatsRow
                icon={<FileText className="w-4 h-4" />}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                label="Luyện đọc"
                ownedCount={reading.ownedCount}
                practicedCount={reading.practicedCount}
                practiceCount={reading.practiceCount}
                avgScore={reading.avgScore}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Card KPI hiển thị số liệu từ vựng: bộ sở hữu, đã luyện, số bài, điểm TB.
function VocabStatsCard({ data }) {
  const hasData = data.ownedCount > 0 || data.practiceCount > 0;
  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Từ vựng</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Bộ sở hữu" value={data.ownedCount} />
        <StatBox label="Đã luyện tập" value={data.practicedCount} />
        <StatBox label="Số bài luyện" value={data.practiceCount} />
        <StatBox label="Điểm TB" value={data.avgScore} suffix="/100" />
      </div>
      {!hasData && (
        <p className="text-xs text-muted-foreground/60 mt-3 text-center">
          Chưa có dữ liệu từ vựng
        </p>
      )}
    </div>
  );
}

/**
 * Card KPI hiển thị số liệu luyện nghe: bài sở hữu, đã luyện, số bài, điểm TB.
 */
function ListeningStatsCard({ data }) {
  const hasData = data.ownedCount > 0 || data.practiceCount > 0;
  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-5 border border-green-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
          <Headphones className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Luyện nghe</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Bài sở hữu" value={data.ownedCount} />
        <StatBox label="Đã luyện tập" value={data.practicedCount} />
        <StatBox label="Số bài luyện" value={data.practiceCount} />
        <StatBox label="Điểm TB" value={data.avgScore} suffix="/100" />
      </div>
      {!hasData && (
        <p className="text-xs text-muted-foreground/60 mt-3 text-center">
          Chưa có dữ liệu luyện nghe
        </p>
      )}
    </div>
  );
}

/**
 * Card KPI hiển thị số liệu luyện đọc: bài sở hữu, đã luyện, số bài, điểm TB.
 */
function ReadingStatsCard({ data }) {
  const hasData = data.ownedCount > 0 || data.practiceCount > 0;
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
          <FileText className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Luyện đọc</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Bài sở hữu" value={data.ownedCount} />
        <StatBox label="Đã luyện tập" value={data.practicedCount} />
        <StatBox label="Số bài luyện" value={data.practiceCount} />
        <StatBox label="Điểm TB" value={data.avgScore} suffix="/100" />
      </div>
      {!hasData && (
        <p className="text-xs text-muted-foreground/60 mt-3 text-center">
          Chưa có dữ liệu luyện đọc
        </p>
      )}
    </div>
  );
}

/**
 * Ô hiển thị một chỉ số đơn lẻ (label + value + suffix) trong card KPI.
 */
function StatBox({ label, value, suffix = "" }) {
  return (
    <div className="bg-white/80 rounded-xl px-3 py-2.5 text-center">
      <p className="text-2xl font-black text-foreground leading-none">{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">
        {label}{suffix}
      </p>
    </div>
  );
}

/**
 * Dòng trong bảng chi tiết thống kê, gồm icon, label và các cột số liệu.
 */
function StatsRow({ icon, iconBg, iconColor, label, ownedCount, practicedCount, practiceCount, avgScore }) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
          <span className="font-bold text-foreground">{label}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-black text-foreground text-base">{ownedCount}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-black text-foreground text-base">{practicedCount}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-black text-foreground text-base">{practiceCount}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <ScoreBadge score={avgScore} />
      </td>
    </tr>
  );
}

/**
 * Badge hiển thị điểm số với màu sắc theo mức: >=80 hồng, >=60 vàng, <60 đỏ.
 */
function ScoreBadge({ score }) {
  const color =
    score >= 80
      ? "bg-pink-100 text-pink-700"
      : score >= 60
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${color}`}>
      <TrendingUp className="w-3.5 h-3.5" />
      {score}
    </span>
  );
}
