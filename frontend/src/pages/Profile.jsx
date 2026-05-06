import { useAuth } from "@/lib/AuthContext";
import { Flame, Zap, BookOpen, LogOut, Star } from "lucide-react";

export default function Profile() {
  const { user: authUser, logout } = useAuth();

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">👤 Hồ sơ</h1>

        {/* Avatar & Name */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md uppercase">
            {authUser.full_name?.charAt(0) || authUser.email?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              {authUser.full_name || "Chưa cập nhật tên"}
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              {authUser.email}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block bg-primary/10 text-primary`}
            >
              Học viên
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-4 text-white shadow-md">
            <Flame className="w-6 h-6 mb-2" />
            <p className="text-3xl font-black">0</p>
            <p className="text-orange-100 text-sm font-semibold">
              Chuỗi hiện tại (Chưa có dữ liệu)
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
            <Zap className="w-6 h-6 text-yellow-300 mb-2" />
            <p className="text-3xl font-black">0</p>
            <p className="text-violet-200 text-sm font-semibold">Tổng XP (Chưa có dữ liệu)</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <BookOpen className="w-6 h-6 text-primary mb-2" />
            <p className="text-3xl font-black text-foreground">
              0
            </p>
            <p className="text-muted-foreground text-sm font-semibold">
              Bộ từ vựng (Chưa có dữ liệu)
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <Star className="w-6 h-6 text-yellow-500 mb-2" />
            <p className="text-3xl font-black text-foreground">
              0
            </p>
            <p className="text-muted-foreground text-sm font-semibold">
              Streak dài nhất (Chưa có dữ liệu)
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout(true)}
          className="w-full flex items-center justify-center gap-3 bg-white border border-red-200 text-red-500 rounded-2xl p-4 font-bold hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
