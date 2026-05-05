import { useState, useEffect } from "react";
import base44 from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { authApi } from "@/api/authApi";
import { User, Flame, Zap, BookOpen, LogOut, Trophy, Star } from "lucide-react";

export default function Profile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const [stats, setStats] = useState({ totalSets: 0, totalProgress: 0 });

  useEffect(() => {
    if (authUser) loadData(authUser);
  }, [authUser]);

  const loadData = async (u) => {
    setUser(u);
    const streaks = await base44.entities.UserStreak.filter({
      created_by: u.email,
    });
    setStreak(streaks[0] || null);
    const sets = await base44.entities.VocabularySet.filter({
      created_by: u.email,
    });
    const progress = await base44.entities.UserProgress.filter({
      created_by: u.email,
    });
    setStats({ totalSets: sets.length, totalProgress: progress.length });
  };

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/login";
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">👤 Hồ sơ</h1>

        {/* Avatar & Name */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md">
            {user.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              {user.full_name}
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              {user.email}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${user.role === "admin" ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}`}
            >
              {user.role === "admin" ? "Admin" : "Học viên"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-4 text-white shadow-md">
            <Flame className="w-6 h-6 mb-2" />
            <p className="text-3xl font-black">{streak?.current_streak || 0}</p>
            <p className="text-orange-100 text-sm font-semibold">
              Chuỗi hiện tại
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
            <Zap className="w-6 h-6 text-yellow-300 mb-2" />
            <p className="text-3xl font-black">{streak?.total_xp || 0}</p>
            <p className="text-violet-200 text-sm font-semibold">Tổng XP</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <BookOpen className="w-6 h-6 text-primary mb-2" />
            <p className="text-3xl font-black text-foreground">
              {stats.totalSets}
            </p>
            <p className="text-muted-foreground text-sm font-semibold">
              Bộ từ vựng
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <Star className="w-6 h-6 text-yellow-500 mb-2" />
            <p className="text-3xl font-black text-foreground">
              {streak?.longest_streak || 0}
            </p>
            <p className="text-muted-foreground text-sm font-semibold">
              Streak dài nhất
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-white border border-red-200 text-red-500 rounded-2xl p-4 font-bold hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
