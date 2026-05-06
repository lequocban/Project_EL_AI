import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import base44 from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Flame,
  Star,
  BookOpen,
  Headphones,
  FileText,
  Trophy,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MODULE_COLORS = {
  vocabulary: "from-violet-500 to-indigo-500",
  grammar: "from-blue-500 to-cyan-500",
  listening: "from-green-500 to-teal-500",
  reading: "from-orange-500 to-amber-500",
  toeic: "from-pink-500 to-rose-500",
};

const FEATURED_SETS = [
  {
    title: "500 từ TOEIC cần biết",
    words: 500,
    level: "intermediate",
    color: "from-violet-500 to-purple-600",
    topic: "toeic",
  },
  {
    title: "Từ vựng du lịch",
    words: 120,
    level: "beginner",
    color: "from-blue-500 to-cyan-500",
    topic: "travel",
  },
  {
    title: "Business English",
    words: 200,
    level: "intermediate",
    color: "from-green-500 to-emerald-600",
    topic: "business",
  },
  {
    title: "Academic Vocabulary",
    words: 350,
    level: "advanced",
    color: "from-orange-500 to-amber-500",
    topic: "academic",
  },
  {
    title: "Phrasal Verbs",
    words: 150,
    level: "intermediate",
    color: "from-pink-500 to-rose-500",
    topic: "general",
  },
  {
    title: "Idioms thông dụng",
    words: 100,
    level: "beginner",
    color: "from-teal-500 to-cyan-600",
    topic: "general",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(null);
  const [recentProgress, setRecentProgress] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const streaks = await base44.entities.UserStreak.filter({
        created_by: user.email,
      });
      setStreak(streaks[0] || null);
      const progress = await base44.entities.UserProgress.filter(
        { created_by: user.email },
        "-created_date",
        10,
      );
      setRecentProgress(progress);
    })();
  }, [user]);

  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const studiedDates = recentProgress
    .map((p) => p.study_date?.split("T")[0])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground">
          Chào {user?.full_name?.split(" ").slice(-1)[0] || "bạn"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Học đều đặn mỗi ngày để đạt mục tiêu!
        </p>
      </div>

      {/* Streak + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 font-semibold text-sm">Chuỗi học</p>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="w-8 h-8" />
                <span className="text-4xl font-black">
                  {streak?.current_streak || 0}
                </span>
                <span className="text-lg font-bold">ngày</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-xs font-medium">Dài nhất</p>
              <p className="text-2xl font-black">
                {streak?.longest_streak || 0}
              </p>
            </div>
          </div>
          {/* Weekly Grid */}
          <div className="flex gap-2 mt-2">
            {weekDays.map((day, i) => {
              const dateStr = day.toISOString().split("T")[0];
              const studied = studiedDates.includes(dateStr);
              const isToday = i === 6;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      studied
                        ? "bg-white text-orange-500"
                        : isToday
                          ? "bg-orange-300/50 border-2 border-white/50"
                          : "bg-orange-300/30"
                    }`}
                  >
                    {studied ? "🔥" : isToday ? "•" : ""}
                  </div>
                  <span className="text-orange-100 text-xs">
                    {DAYS[day.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* XP Card */}
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-violet-200 font-semibold text-sm">Tổng XP</p>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-7 h-7 text-yellow-300" />
                <span className="text-4xl font-black">
                  {streak?.total_xp || 0}
                </span>
              </div>
            </div>
            <Star className="w-12 h-12 text-yellow-300/60" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-sm text-violet-200 font-medium">
              <span>Tiến độ hôm nay</span>
              <span>
                {
                  recentProgress.filter((p) =>
                    p.study_date?.startsWith(
                      new Date().toISOString().split("T")[0],
                    ),
                  ).length
                }{" "}
                bài
              </span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 rounded-full transition-all"
                style={{
                  width: `${Math.min(recentProgress.length * 10, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="mb-8">
        <h2 className="text-lg font-black text-foreground mb-4">
          Tiếp tục học
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              path: "/vocabulary",
              label: "Từ vựng",
              icon: BookOpen,
              grad: MODULE_COLORS.vocabulary,
              emoji: "📚",
            },
            {
              path: "/grammar",
              label: "Ngữ pháp",
              icon: FileText,
              grad: MODULE_COLORS.grammar,
              emoji: "✏️",
            },
            {
              path: "/listening",
              label: "Luyện nghe",
              icon: Headphones,
              grad: MODULE_COLORS.listening,
              emoji: "🎧",
            },
            {
              path: "/reading",
              label: "Luyện đọc",
              icon: FileText,
              grad: MODULE_COLORS.reading,
              emoji: "📖",
            },
            {
              path: "/toeic",
              label: "TOEIC",
              icon: Trophy,
              grad: MODULE_COLORS.toeic,
              emoji: "🏆",
            },
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

      {/* Featured Public Vocab Sets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-foreground">
            Bộ từ vựng đề xuất
          </h2>
          <Link
            to="/vocabulary"
            className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
          >
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_SETS.map((set, i) => (
            <Link
              key={set.id || i}
              to="/vocabulary"
              className="bg-white rounded-2xl p-5 border border-border card-hover group"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${set.color || "from-violet-500 to-indigo-500"} rounded-xl flex items-center justify-center mb-3 shadow-md`}
              >
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {set.title}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {set.word_count || set.words || 0} từ
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    set.level === "beginner"
                      ? "bg-green-100 text-green-700"
                      : set.level === "intermediate"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {set.level === "beginner"
                    ? "Cơ bản"
                    : set.level === "intermediate"
                      ? "Trung cấp"
                      : "Nâng cao"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
