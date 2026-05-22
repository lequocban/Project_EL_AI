import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Headphones,
  FileText,
  ChevronRight,
  BookText,
  TrendingUp,
} from "lucide-react";
import { vocabularyApi } from "@/api/client/vocabularyApi";
import { listeningApi } from "@/api/client/listeningApi";
import { readingApi } from "@/api/client/readingApi";
import Footer from "@/components/layouts/Footer";

const MODULE_COLORS = {
  vocabulary: "from-violet-500 to-indigo-500",
  grammar: "from-blue-500 to-cyan-500",
  listening: "from-green-500 to-teal-500",
  reading: "from-orange-500 to-amber-500",
  toeic: "from-pink-500 to-rose-500",
};

// Trang chủ hiển thị tổng quan học tập
export default function Home() {
  const { user } = useAuth();
  const [mySets, setMySets] = useState([]);
  const [listeningLessons, setListeningLessons] = useState([]);
  const [readingLessons, setReadingLessons] = useState([]);

  // Danh sách mẹo học tập hiển thị ngẫu nhiên
  const learningTips = [
    "Mỗi ngày học 10 từ mới sẽ giúp bạn nhớ lâu hơn!",
    "Nghe đi nghe lại nhiều lần là chìa khóa để cải thiện kỹ năng nghe.",
    "Đọc to giúp bạn luyện phát âm và ghi nhớ từ vựng tốt hơn.",
    "Học ngữ pháp qua ví dụ thực tế sẽ dễ hiểu hơn là học thuộc lòng.",
    "Dành 15 phút mỗi ngày ôn lại từ cũ trước khi học từ mới.",
    "Ghi chú bằng hình ảnh giúp não bộ ghi nhớ thông tin nhanh hơn.",
    "Luyện nghe kết hợp đọc phụ đề để tăng vốn từ và kỹ năng nghe.",
    "Đặt câu với từ mới giúp bạn nhớ nghĩa và cách dùng từ.",
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Tải dữ liệu bộ từ vựng, bài nghe và bài đọc của người dùng
  const loadData = async () => {
    try {
      const sets = await vocabularyApi.getMySets();
      console.debug("[Home loadData] sets:", JSON.stringify(sets));
      setMySets(sets.items || []);
    } catch {
      setMySets([]);
    }
    // Luyện nghe - lấy từ API
    try {
      const listeningData = await listeningApi.getMyLessons({ limit: 6 });
      setListeningLessons(listeningData.items || []);
    } catch {
      setListeningLessons([]);
    }
    // Luyện đọc - lấy từ API
    try {
      const readingData = await readingApi.getMyLessons({ limit: 6 });
      setReadingLessons(readingData.items || []);
    } catch {
      setReadingLessons([]);
    }
  };

  const SET_COLORS = [
    "from-violet-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
  ];

  const LEVEL_LABELS = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
  const LEVEL_BADGE = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-blue-100 text-blue-700",
    advanced: "bg-purple-100 text-purple-700",
  };

  // Tính số cột hiển thị theo kích thước màn hình để slice items vừa 1 hàng
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setCols(6);
      else if (w >= 1024) setCols(5);
      else if (w >= 768) setCols(4);
      else if (w >= 640) setCols(3);
      else setCols(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Lấy items mới nhất vừa đủ 1 hàng
  const recentSets = [...mySets].reverse().slice(0, cols);
  const recentListening = [...listeningLessons].reverse().slice(0, cols);
  const recentReading = [...readingLessons].reverse().slice(0, cols);

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground">
          Chào {user?.full_name?.split(" ").slice(-1)[0] || "bạn"}
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Học đều đặn mỗi ngày để đạt mục tiêu!
        </p>
      </div>

      {/* Thống kê nhanh & Mẹo học tập */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-12 w-16 h-16 bg-white/5 rounded-full blur-xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-pink-100 font-semibold text-sm mb-4">📊 Thống kê của bạn</p>
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <p className="text-3xl font-black drop-shadow-lg">{mySets.length}</p>
                <p className="text-xs text-pink-200 font-medium mt-1">📚 Bộ từ</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-black drop-shadow-lg">{listeningLessons.length}</p>
                <p className="text-xs text-pink-200 font-medium mt-1">🎧 Bài nghe</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-black drop-shadow-lg">{readingLessons.length}</p>
                <p className="text-xs text-pink-200 font-medium mt-1">📖 Bài đọc</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-cyan-300/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col items-start">
            <p className="text-emerald-100 font-semibold text-sm mb-3">💡 Mẹo học tập</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 w-full">
              <p className="text-base font-bold leading-relaxed">
                {learningTips[Math.floor(Math.random() * learningTips.length)]}
              </p>
            </div>
          </div>
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
            { path: "/stats",       label: "Thống kê", icon: TrendingUp, grad: MODULE_COLORS.toeic,     emoji: "📊" },
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

      {/* Bộ từ của tôi */}
      {mySets.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-foreground">Bộ từ của tôi</h2>
            <Link
              to="/vocabulary"
              className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recentSets.map((set, i) => (
              <Link
                key={set.id}
                to={`/vocabulary?set=${set.id}`}
                className="bg-white rounded-2xl p-4 border border-border card-hover cursor-pointer min-w-0"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${SET_COLORS[i % SET_COLORS.length]} rounded-xl flex items-center justify-center mb-3 shadow-sm`}
                >
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                  {set.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {set.wordCount || 0} từ
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Luyện nghe */}
      {listeningLessons.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-foreground">Luyện nghe</h2>
            <Link
              to="/listening"
              className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recentListening.map((lesson) => (
              <Link
                key={lesson.id}
                to="/listening"
                className="bg-white rounded-2xl p-4 border border-border card-hover cursor-pointer min-w-0"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_BADGE[lesson.level]}`}>
                    {LEVEL_LABELS[lesson.level]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Luyện đọc */}
      {readingLessons.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-foreground">Luyện đọc</h2>
            <Link
              to="/reading"
              className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recentReading.map((lesson) => (
              <Link
                key={lesson.id}
                to="/reading"
                className="bg-white rounded-2xl p-4 border border-border card-hover cursor-pointer min-w-0"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                  <BookText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_BADGE[lesson.level]}`}>
                    {LEVEL_LABELS[lesson.level]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer className="mt-auto bg-muted" />
    </div>
  );
}
