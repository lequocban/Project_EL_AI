import { useQueries } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  BookText,
  Headphones,
  CheckCircle,
  Clock,
  Shield,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { adminApi } from "@/api/admin/adminApi";
import { vocabularyApi } from "@/api/client/vocabularyApi";
import { readingApi } from "@/api/client/readingApi";
import { listeningApi } from "@/api/client/listeningApi";
import { useAdminAuth } from "@/lib/AdminAuthContext";

// Lấy tổng số người dùng (gọi API với limit=1 để lấy total từ phân trang)
const fetchTotalUsers = async () => {
  const res = await adminApi.getUsers({ page: 1, limit: 1 });
  return res.data?.total ?? 0;
};

// Lấy số người dùng đang hoạt động
const fetchActiveUsers = async () => {
  const res = await adminApi.getUsers({ page: 1, limit: 1, status: "active" });
  return res.data?.total ?? 0;
};

// Lấy số người dùng bị khóa
const fetchInactiveUsers = async () => {
  const res = await adminApi.getUsers({ page: 1, limit: 1, status: "inactive" });
  return res.data?.total ?? 0;
};

// Lấy tổng số bộ từ vựng công khai
const fetchTotalVocabularySets = async () => {
  const res = await vocabularyApi.getPublicSets();
  return Array.isArray(res) ? res.length : 0;
};

// Lấy số bộ từ vựng công khai
const fetchPublicVocabularySets = async () => {
  const res = await vocabularyApi.getPublicSets();
  return Array.isArray(res) ? res.length : 0;
};

// Lấy số bộ từ vựng chờ duyệt
const fetchPendingVocabularySets = async () => {
  const res = await adminApi.getVocabPending({ page: 1, limit: 1 });
  return res.data?.total ?? 0;
};

// Lấy tổng số bài luyện đọc công khai
const fetchTotalReadingLessons = async () => {
  const res = await readingApi.getPublicLessons({ page: 1, limit: 1 });
  return res.total ?? 0;
};

// Lấy số bài luyện đọc công khai
const fetchPublicReadingLessons = async () => {
  const res = await readingApi.getPublicLessons({ page: 1, limit: 1 });
  return res.total ?? 0;
};

// Lấy số bài luyện đọc chờ duyệt
const fetchPendingReadingLessons = async () => {
  const res = await adminApi.getReadingPending({ page: 1, limit: 1 });
  return res.data?.total ?? 0;
};

// Lấy tổng số bài luyện nghe công khai
const fetchTotalListeningLessons = async () => {
  const res = await listeningApi.getPublicLessons({ page: 1, limit: 1 });
  return res.total ?? 0;
};

// Lấy số bài luyện nghe công khai
const fetchPublicListeningLessons = async () => {
  const res = await listeningApi.getPublicLessons({ page: 1, limit: 1 });
  return res.total ?? 0;
};

// Lấy số bài luyện nghe chờ duyệt
const fetchPendingListeningLessons = async () => {
  const res = await adminApi.getListeningPending({ page: 1, limit: 1 });
  return res.data?.total ?? 0;
};

export default function AdminDashboard() {
  const { admin } = useAdminAuth();

  const isAdminOnly = admin?.role === "admin";

  // Gọi song song tất cả các API để lấy số liệu
  const queryResults = useQueries({
    queries: [
      { queryKey: ["admin", "totalUsers"], queryFn: fetchTotalUsers, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "activeUsers"], queryFn: fetchActiveUsers, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "inactiveUsers"], queryFn: fetchInactiveUsers, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "totalVocabularySets"], queryFn: fetchTotalVocabularySets, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "publicVocabularySets"], queryFn: fetchPublicVocabularySets, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "pendingVocabularySets"], queryFn: fetchPendingVocabularySets, staleTime: 30 * 1000, retry: 2 },
      { queryKey: ["admin", "totalReadingLessons"], queryFn: fetchTotalReadingLessons, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "publicReadingLessons"], queryFn: fetchPublicReadingLessons, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "pendingReadingLessons"], queryFn: fetchPendingReadingLessons, staleTime: 30 * 1000, retry: 2 },
      { queryKey: ["admin", "totalListeningLessons"], queryFn: fetchTotalListeningLessons, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "publicListeningLessons"], queryFn: fetchPublicListeningLessons, staleTime: 60 * 1000, retry: 2 },
      { queryKey: ["admin", "pendingListeningLessons"], queryFn: fetchPendingListeningLessons, staleTime: 30 * 1000, retry: 2 },
    ],
  });

  const [
    totalUsersResult,
    activeUsersResult,
    inactiveUsersResult,
    totalVocabularySetsResult,
    publicVocabularySetsResult,
    pendingVocabularySetsResult,
    totalReadingLessonsResult,
    publicReadingLessonsResult,
    pendingReadingLessonsResult,
    totalListeningLessonsResult,
    publicListeningLessonsResult,
    pendingListeningLessonsResult,
  ] = queryResults;

  // Trạng thái loading: chỉ khi tất cả đang loading
  const isLoading = queryResults.some((q) => q.isLoading);
  const isFetching = queryResults.some((q) => q.isFetching);
  const hasError = queryResults.some((q) => q.isError);

  // Số liệu tổng hợp
  const stats = {
    totalUsers: totalUsersResult.data ?? 0,
    activeUsers: activeUsersResult.data ?? 0,
    inactiveUsers: inactiveUsersResult.data ?? 0,
    totalVocabularySets: totalVocabularySetsResult.data ?? 0,
    publicVocabularySets: publicVocabularySetsResult.data ?? 0,
    pendingVocabularySets: pendingVocabularySetsResult.data ?? 0,
    totalReadingLessons: totalReadingLessonsResult.data ?? 0,
    publicReadingLessons: publicReadingLessonsResult.data ?? 0,
    pendingReadingLessons: pendingReadingLessonsResult.data ?? 0,
    totalListeningLessons: totalListeningLessonsResult.data ?? 0,
    publicListeningLessons: publicListeningLessonsResult.data ?? 0,
    pendingListeningLessons: pendingListeningLessonsResult.data ?? 0,
  };

  // Tổng số nội dung chờ duyệt
  const totalPending =
    stats.pendingVocabularySets +
    stats.pendingReadingLessons +
    stats.pendingListeningLessons;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Tổng quan</h1>
        <p className="text-slate-500 mt-1 font-medium">Xem nhanh tình trạng hệ thống</p>
      </div>

      {hasError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <RefreshCw className="w-4 h-4" />
            Một số số liệu không thể tải. Hãy thử tải lại trang.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Tải lại
          </button>
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Đang cập nhật...
        </div>
      )}

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={stats.totalUsers}
          color="from-violet-500 to-indigo-500"
        />
        <StatCard
          icon={BookOpen}
          label="Bộ từ vựng"
          value={stats.totalVocabularySets}
          sub={`${stats.pendingVocabularySets} chờ duyệt`}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={BookText}
          label="Bài luyện đọc"
          value={stats.totalReadingLessons}
          sub={`${stats.pendingReadingLessons} chờ duyệt`}
          color="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={Headphones}
          label="Bài luyện nghe"
          value={stats.totalListeningLessons}
          sub={`${stats.pendingListeningLessons} chờ duyệt`}
          color="from-green-500 to-teal-500"
        />
      </div>

      {/* Chi tiết người dùng */}
      {isAdminOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={CheckCircle}
            label="Tài khoản hoạt động"
            value={stats.activeUsers}
            color="from-emerald-500 to-green-500"
          />
          <StatCard
            icon={Clock}
            label="Tài khoản bị khóa"
            value={stats.inactiveUsers}
            color="from-red-500 to-rose-500"
          />
          <StatCard
            icon={Users}
            label="Tổng lượt luyện tập"
            value={0}
            color="from-pink-500 to-rose-500"
          />
        </div>
      )}

      {/* Nội dung chờ duyệt */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-500" />
          Nội dung chờ kiểm duyệt
          {totalPending > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
              {totalPending}
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PendingCard
            label="Bộ từ vựng"
            count={stats.pendingVocabularySets}
            href="/admin/vocabulary"
            color="bg-blue-50 text-blue-600"
            icon={BookOpen}
          />
          <PendingCard
            label="Bài luyện đọc"
            count={stats.pendingReadingLessons}
            href="/admin/reading"
            color="bg-orange-50 text-orange-600"
            icon={BookText}
          />
          <PendingCard
            label="Bài luyện nghe"
            count={stats.pendingListeningLessons}
            href="/admin/listening"
            color="bg-green-50 text-green-600"
            icon={Headphones}
          />
        </div>
      </div>

      {/* Nội dung công khai */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Tổng quan nội dung</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <OverviewCard
            label="Bộ từ vựng công khai"
            value={stats.publicVocabularySets}
            icon={BookOpen}
            color="text-blue-600 bg-blue-50"
          />
          <OverviewCard
            label="Bài luyện đọc công khai"
            value={stats.publicReadingLessons}
            icon={BookText}
            color="text-orange-600 bg-orange-50"
          />
          <OverviewCard
            label="Bài luyện nghe công khai"
            value={stats.publicListeningLessons}
            icon={Headphones}
            color="text-green-600 bg-green-50"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function PendingCard({ label, count, href, color, icon: Icon }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl p-4 ${color} hover:opacity-80 transition-opacity`}
    >
      <Icon className="w-6 h-6" />
      <div className="flex-1">
        <div className="font-bold text-lg">{count}</div>
        <div className="text-sm opacity-80 font-medium">{label}</div>
      </div>
    </a>
  );
}

function OverviewCard({ label, value, icon: Icon, color }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl p-4 ${color}`}>
      <Icon className="w-6 h-6" />
      <div className="flex-1">
        <div className="font-bold text-lg">{value.toLocaleString()}</div>
        <div className="text-sm opacity-80 font-medium">{label}</div>
      </div>
    </div>
  );
}
