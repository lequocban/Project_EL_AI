import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  BookText,
  Headphones,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { useAdminAuth } from "@/lib/AdminAuthContext";

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdminOnly = admin?.role === "admin";

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getStats();
      setStats(response.data);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể tải thống kê");
    } finally {
      setIsLoading(false);
    }
  };

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

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={stats?.totalUsers ?? 0}
          color="from-violet-500 to-indigo-500"
        />
        <StatCard
          icon={BookOpen}
          label="Bộ từ vựng"
          value={stats?.totalVocabularySets ?? 0}
          sub={`${stats?.pendingVocabularySets ?? 0} chờ duyệt`}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={BookText}
          label="Bài luyện đọc"
          value={stats?.totalReadingLessons ?? 0}
          sub={`${stats?.pendingReadingLessons ?? 0} chờ duyệt`}
          color="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={Headphones}
          label="Bài luyện nghe"
          value={stats?.totalListeningLessons ?? 0}
          sub={`${stats?.pendingListeningLessons ?? 0} chờ duyệt`}
          color="from-green-500 to-teal-500"
        />
      </div>

      {/* Chi tiết người dùng */}
      {isAdminOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={CheckCircle}
            label="Tài khoản hoạt động"
            value={stats?.activeUsers ?? 0}
            color="from-emerald-500 to-green-500"
          />
          <StatCard
            icon={Clock}
            label="Tài khoản bị khóa"
            value={stats?.inactiveUsers ?? 0}
            color="from-red-500 to-rose-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Tổng lượt luyện tập"
            value={stats?.totalPracticeSessions ?? 0}
            color="from-pink-500 to-rose-500"
          />
        </div>
      )}

      {/* Nội dung chờ duyệt */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-500" />
          Nội dung chờ kiểm duyệt
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PendingCard
            label="Bộ từ vựng"
            count={stats?.pendingVocabularySets ?? 0}
            href="/admin/vocabulary"
            color="bg-blue-50 text-blue-600"
            icon={BookOpen}
          />
          <PendingCard
            label="Bài luyện đọc"
            count={stats?.pendingReadingLessons ?? 0}
            href="/admin/reading"
            color="bg-orange-50 text-orange-600"
            icon={BookText}
          />
          <PendingCard
            label="Bài luyện nghe"
            count={stats?.pendingListeningLessons ?? 0}
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
            value={stats?.publicVocabularySets ?? 0}
            icon={BookOpen}
            color="text-blue-600 bg-blue-50"
          />
          <OverviewCard
            label="Bài luyện đọc công khai"
            value={stats?.publicReadingLessons ?? 0}
            icon={BookText}
            color="text-orange-600 bg-orange-50"
          />
          <OverviewCard
            label="Bài luyện nghe công khai"
            value={stats?.publicListeningLessons ?? 0}
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
