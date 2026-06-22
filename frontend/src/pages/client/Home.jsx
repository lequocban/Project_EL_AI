import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BookText,
  ChevronRight,
  FileText,
  Flame,
  Headphones,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { vocabularyApi } from "@/api/client/vocabularyApi";
import { listeningApi } from "@/api/client/listeningApi";
import { readingApi } from "@/api/client/readingApi";
import Footer from "@/components/layouts/Footer";

const MODULES = [
  { path: "/vocabulary", label: "Từ vựng", desc: "Flashcard và game", icon: BookOpen, color: "text-primary" },
  { path: "/lookup", label: "Tra cứu", desc: "Tìm nghĩa nhanh", icon: Search, color: "text-[#1CB0F6]" },
  { path: "/listening", label: "Luyện nghe", desc: "Hội thoại và câu hỏi", icon: Headphones, color: "text-[#00CD9C]" },
  { path: "/reading", label: "Luyện đọc", desc: "Bài đọc theo cấp độ", icon: FileText, color: "text-[#FF9600]" },
  { path: "/stats", label: "Thống kê", desc: "Theo dõi tiến độ", icon: BarChart3, color: "text-[#CE82FF]" },
];

const LEARNING_TIPS = [
  "Học 10 từ mới mỗi ngày và ôn lại trong 15 phút để ghi nhớ lâu hơn.",
  "Nghe lại một bài 2 đến 3 lần sẽ giúp bạn nhận ra âm nối và từ khóa nhanh hơn.",
  "Đọc to một đoạn ngắn giúp cải thiện phát âm và tăng khả năng ghi nhớ.",
  "Đặt một câu riêng với từ mới để nhớ nghĩa và cách dùng trong ngữ cảnh.",
  "Kết hợp nghe và đọc transcript để mở rộng vốn từ mà không bị quá tải.",
];

const LEVEL_LABELS = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
const LEVEL_BADGE = {
  beginner: "border-[#C7F8A1] bg-[#E5FFC2] text-[#3D7400]",
  intermediate: "border-[#84D8F8] bg-[#E8F7FE] text-[#0E84B5]",
  advanced: "border-[#DDB7FF] bg-[#F6E8FF] text-[#8549BA]",
};

function SectionHeader({ title, to }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-xl font-black text-foreground">{title}</h2>
      <Link
        to={to}
        className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-extrabold uppercase tracking-[0.8px] text-[#58A700] hover:underline"
      >
        Xem tất cả
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function EmptyCard({ icon: Icon, title, desc, to, action }) {
  return (
    <div className="lingo-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#C7F8A1] bg-[#E5FFC2] text-[#3D7400]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-black text-foreground">{title}</h3>
      <p className="mx-auto mb-5 max-w-sm text-sm font-medium leading-relaxed text-muted-foreground">{desc}</p>
      <Link to={to} className="lingo-button-secondary px-5 py-3 text-xs">
        {action}
      </Link>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [mySets, setMySets] = useState([]);
  const [listeningLessons, setListeningLessons] = useState([]);
  const [readingLessons, setReadingLessons] = useState([]);
  const [tipIndex, setTipIndex] = useState(() => new Date().getDate() % LEARNING_TIPS.length);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTipIndex((currentIndex) => (currentIndex + 1) % LEARNING_TIPS.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    try {
      const sets = await vocabularyApi.getMySets();
      setMySets(sets.items || []);
    } catch {
      setMySets([]);
    }

    try {
      const listeningData = await listeningApi.getMyLessons({ limit: 6 });
      setListeningLessons(listeningData.items || []);
    } catch {
      setListeningLessons([]);
    }

    try {
      const readingData = await readingApi.getMyLessons({ limit: 6 });
      setReadingLessons(readingData.items || []);
    } catch {
      setReadingLessons([]);
    }
  };

  const displayName = user?.full_name?.split(" ").slice(-1)[0] || "bạn";

  const recentSets = [...mySets].reverse().slice(0, 6);
  const recentListening = [...listeningLessons].reverse().slice(0, 6);
  const recentReading = [...readingLessons].reverse().slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="lingo-card-lg p-6 md:p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[#C7F8A1] bg-[#E5FFC2] px-4 py-2 text-sm font-extrabold uppercase tracking-[0.8px] text-[#3D7400]">
                <Flame className="h-4 w-4" />
                Sẵn sàng học tiếp
              </div>
              <h1 className="mb-4 text-3xl font-black leading-tight tracking-[-0.3px] text-foreground md:text-5xl">
                Chào {displayName}, hôm nay mình học gì?
              </h1>
              <p className="mb-6 max-w-2xl text-[17px] font-medium leading-relaxed text-muted-foreground">
                Chọn một kỹ năng, tiếp tục bài gần đây hoặc tạo nội dung mới bằng AI để giữ thói quen học đều.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/vocabulary" className="lingo-button-brand text-sm">
                  Học từ vựng
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link to="/stats" className="lingo-button-secondary text-sm">
                  Xem tiến độ
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="lingo-card p-5">
                <BookOpen className="mb-3 h-7 w-7 text-primary" />
                <p className="text-3xl font-black text-foreground">{mySets.length}</p>
                <p className="mt-1 text-sm font-bold text-muted-foreground">Bộ từ vựng</p>
              </div>
              <div className="lingo-card p-5">
                <Headphones className="mb-3 h-7 w-7 text-[#00CD9C]" />
                <p className="text-3xl font-black text-foreground">{listeningLessons.length}</p>
                <p className="mt-1 text-sm font-bold text-muted-foreground">Bài nghe</p>
              </div>
              <div className="lingo-card p-5">
                <BookText className="mb-3 h-7 w-7 text-[#FF9600]" />
                <p className="text-3xl font-black text-foreground">{readingLessons.length}</p>
                <p className="mt-1 text-sm font-bold text-muted-foreground">Bài đọc</p>
              </div>
            </div>
          </section>

          <section className="mb-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lingo-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#FFE89B] bg-[#FFF8E0] text-[#8A6F00]">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.8px] text-muted-foreground">Mẹo hôm nay</p>
                  <h2 className="text-xl font-black">Học ngắn nhưng đều</h2>
                </div>
              </div>
              <p key={tipIndex} className="tip-fade-slide min-h-[4.75rem] text-[17px] font-medium leading-relaxed text-muted-foreground">
                {LEARNING_TIPS[tipIndex]}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-black text-foreground">Tiếp tục học</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {MODULES.map(({ path, label, desc, icon: Icon, color }) => (
                  <Link key={path} to={path} className="lingo-card card-hover block p-5">
                    <Icon className={`mb-4 h-7 w-7 ${color}`} />
                    <h3 className="text-lg font-black text-foreground">{label}</h3>
                    <p className="mt-1 text-sm font-bold text-muted-foreground">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <SectionHeader title="Bộ từ của tôi" to="/vocabulary" />
            {recentSets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {recentSets.map((set) => (
                  <Link key={set.id} to={`/vocabulary?set=${set.id}`} className="lingo-card card-hover block min-w-0 p-5">
                    <BookOpen className="mb-4 h-7 w-7 text-primary" />
                    <h3 className="line-clamp-2 text-base font-black leading-snug text-foreground">{set.title}</h3>
                    <p className="mt-3 text-sm font-bold text-muted-foreground">{set.wordCount || 0} từ</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyCard
                icon={Sparkles}
                title="Chưa có bộ từ nào"
                desc="Tạo bộ từ đầu tiên hoặc để AI gợi ý nội dung theo chủ đề bạn cần học."
                to="/vocabulary"
                action="Tạo bộ từ"
              />
            )}
          </section>

          <section className="mb-8 grid gap-8 xl:grid-cols-2">
            <div>
              <SectionHeader title="Luyện nghe" to="/listening" />
              {recentListening.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {recentListening.map((lesson) => (
                    <Link key={lesson.id} to="/listening" className="lingo-card card-hover block min-w-0 p-5">
                      <Headphones className="mb-4 h-7 w-7 text-[#00CD9C]" />
                      <h3 className="line-clamp-2 text-base font-black leading-snug text-foreground">{lesson.title}</h3>
                      <span className={`mt-4 inline-flex rounded-xl border-2 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.6px] ${LEVEL_BADGE[lesson.level] || LEVEL_BADGE.beginner}`}>
                        {LEVEL_LABELS[lesson.level] || "Cơ bản"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyCard
                  icon={Headphones}
                  title="Chưa có bài nghe"
                  desc="Tạo bài nghe theo chủ đề hoặc bắt đầu từ các bài có sẵn."
                  to="/listening"
                  action="Mở luyện nghe"
                />
              )}
            </div>

            <div>
              <SectionHeader title="Luyện đọc" to="/reading" />
              {recentReading.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {recentReading.map((lesson) => (
                    <Link key={lesson.id} to="/reading" className="lingo-card card-hover block min-w-0 p-5">
                      <BookText className="mb-4 h-7 w-7 text-[#FF9600]" />
                      <h3 className="line-clamp-2 text-base font-black leading-snug text-foreground">{lesson.title}</h3>
                      <span className={`mt-4 inline-flex rounded-xl border-2 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.6px] ${LEVEL_BADGE[lesson.level] || LEVEL_BADGE.beginner}`}>
                        {LEVEL_LABELS[lesson.level] || "Cơ bản"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyCard
                  icon={BookText}
                  title="Chưa có bài đọc"
                  desc="Tạo bài đọc mới theo cấp độ để luyện đọc hiểu và mở rộng từ vựng."
                  to="/reading"
                  action="Mở luyện đọc"
                />
              )}
            </div>
          </section>

          <section className="lingo-card-lg p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-[#FFC800]" />
                  <h2 className="text-2xl font-black">Hoàn thành mục tiêu nhỏ hôm nay</h2>
                </div>
                <p className="max-w-2xl text-[17px] font-medium leading-relaxed text-muted-foreground">
                  Làm một game từ vựng, một bài nghe ngắn hoặc một bài đọc để giữ mạch học tập.
                </p>
              </div>
              <Link to="/leaderboard" className="lingo-button-brand text-sm">
                Xem xếp hạng
                <ShieldCheck className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer className="mt-auto border-t-2 border-border bg-white" />
    </div>
  );
}
