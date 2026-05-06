import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  BookOpen,
  Headphones,
  FileText,
  Trophy,
} from "lucide-react";

const MODULE_COLORS = {
  vocabulary: "from-violet-500 to-indigo-500",
  grammar: "from-blue-500 to-cyan-500",
  listening: "from-green-500 to-teal-500",
  reading: "from-orange-500 to-amber-500",
  toeic: "from-pink-500 to-rose-500",
};

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground">
          Chào {user?.full_name?.split(" ").slice(-1)[0] || "bạn"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Học đều đặn mỗi ngày để đạt mục tiêu!
        </p>
      </div>

      {/* Streak & XP: no backend API yet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center items-start">
          <p className="text-orange-100 font-semibold text-sm mb-1">Chuỗi học</p>
          <p className="text-2xl font-black">Chưa có dữ liệu</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center items-start">
          <p className="text-violet-200 font-semibold text-sm mb-1">Tổng XP</p>
          <p className="text-2xl font-black">Chưa có dữ liệu</p>
        </div>
      </div>

      {/* Modules */}
      <div className="mb-8">
        <h2 className="text-lg font-black text-foreground mb-4">Tiếp tục học</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { path: "/vocabulary", label: "Từ vựng", icon: BookOpen, grad: MODULE_COLORS.vocabulary, emoji: "📚" },
            { path: "/grammar",    label: "Ngữ pháp", icon: FileText,  grad: MODULE_COLORS.grammar,    emoji: "✏️" },
            { path: "/listening",  label: "Luyện nghe", icon: Headphones, grad: MODULE_COLORS.listening, emoji: "🎧" },
            { path: "/reading",    label: "Luyện đọc",  icon: FileText, grad: MODULE_COLORS.reading,   emoji: "📖" },
            { path: "/toeic",      label: "TOEIC",      icon: Trophy,   grad: MODULE_COLORS.toeic,      emoji: "🏆" },
          ].map((m) => (
            <Link
              key={m.path}
              to={m.path}
              className={`bg-gradient-to-br ${m.grad} rounded-2xl p-4 text-white text-center shadow-md card-hover flex flex-col items-center gap-2`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="font-bold text-sm">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
    </div>
  );
}
