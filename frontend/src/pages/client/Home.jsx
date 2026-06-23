import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { vocabularyApi } from "@/api/client/vocabularyApi";
import { listeningApi } from "@/api/client/listeningApi";
import { readingApi } from "@/api/client/readingApi";
import Footer from "@/components/layouts/Footer";
import AnimatedIcon from "@/components/ui/animated-icon";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MODULES = [
  { path: "/vocabulary", label: "Từ vựng", desc: "Flashcard và game", icon: "vocabulary", color: "text-primary" },
  { path: "/lookup", label: "Tra cứu", desc: "Tìm nghĩa nhanh", icon: "lookup", color: "text-[#1CB0F6]" },
  { path: "/listening", label: "Luyện nghe", desc: "Hội thoại và câu hỏi", icon: "listening", color: "text-[#00CD9C]" },
  { path: "/reading", label: "Luyện đọc", desc: "Bài đọc theo cấp độ", icon: "reading", color: "text-[#FF9600]" },
  { path: "/stats", label: "Thống kê", desc: "Theo dõi tiến độ", icon: "stats", color: "text-[#CE82FF]" },
];

const MODULE_CARD_CLASSES = {
  "/vocabulary":
    "!border-[#C7F8A1] !bg-[#F3FFE8] hover:!border-[#9BE765] hover:!bg-[#E5FFC2]",
  "/lookup":
    "!border-[#B7E8FF] !bg-[#EFFAFF] hover:!border-[#84D8F8] hover:!bg-[#E2F6FF]",
  "/listening":
    "!border-[#99F2DF] !bg-[#E9FFF9] hover:!border-[#5EE6CA] hover:!bg-[#D5FFF4]",
  "/reading":
    "!border-[#FFD18A] !bg-[#FFF7E8] hover:!border-[#FFB84D] hover:!bg-[#FFECC7]",
  "/stats":
    "!border-[#DDB7FF] !bg-[#F8EEFF] hover:!border-[#C994FF] hover:!bg-[#F6E8FF]",
};

const LEARNING_TIPS = [
  "Học 10 từ mới mỗi ngày và ôn lại trong 15 phút để ghi nhớ lâu hơn.",
  "Nghe lại một bài 2 đến 3 lần sẽ giúp bạn nhận ra âm nối và từ khóa nhanh hơn.",
  "Đọc to một đoạn ngắn giúp cải thiện phát âm và tăng khả năng ghi nhớ.",
  "Đặt một câu riêng với từ mới để nhớ nghĩa và cách dùng trong ngữ cảnh.",
  "Kết hợp nghe và đọc transcript để mở rộng vốn từ mà không bị quá tải.",
];

const LEVEL_LABELS = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
const HERO_GIFS = [
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXZibHJlZnRoNTY2czd5ZHI2YW1sdGlvMTA4eGJlNzZ4OHFwMnl0NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uWwg8tjEm17Co/giphy.gif",
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzdiMzdzOTdweHJicWtyZnRjaHh1bm1udDlpN25oeHM3dXQwdzdkOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Q9NrmGiBbsvfO/giphy.gif",
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGRxamI1bWtoZnA2eTN3aDh3OWliem8zY3R2Y3BkMDRwZ2p4eXFxdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cBKMTJGAE8y2Y/giphy.gif",
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDE0d2l5em5vZDUxYXlkMjc2dHpxZnp1cHJ6YTExdzdkOXN4amVhZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/icIr8rk03xQI6NS67S/giphy.gif",
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTZwNThkZGJpOWRsOGVxMmY1bjBhZDVmZzRkaXZyNDRoZnVycmU4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d47HFwAbGv3OmqfC/giphy.gif",
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzRjMzlyeDY5eng3NWVsbmt1MnVuejhtcGFmbmIxcHBxZ3NpZWs1eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y4P943aTJRCYfperyN/giphy.gif",
];
const DEFAULT_HERO_GIF_URL = HERO_GIFS[0];
const HERO_GIF_STORAGE_KEY = "englishup_home_hero_gif";

const LEVEL_BADGE = {
  beginner: "border-[#C7F8A1] bg-[#E5FFC2] text-[#3D7400]",
  intermediate: "border-[#84D8F8] bg-[#E8F7FE] text-[#0E84B5]",
  advanced: "border-[#DDB7FF] bg-[#F6E8FF] text-[#8549BA]",
};

const interactiveHomeCardClass =
  "transition-all duration-200 ease-out hover:-translate-y-1 active:translate-y-0.5";
const heroCardClass =
  "lingo-card-lg !border-[#C7F8A1] !bg-[linear-gradient(135deg,#F3FFE8_0%,#E9FFF9_58%,#FFFFFF_100%)]";
const ctaCardClass =
  "lingo-card-lg !border-[#DDB7FF] !bg-[linear-gradient(135deg,#F6E8FF_0%,#E9FFF9_100%)]";
const vocabularyCardClass = `lingo-card block min-w-0 !border-[#C7F8A1] !bg-[#F3FFE8] ${interactiveHomeCardClass} hover:!border-[#9BE765] hover:!bg-[#E5FFC2]`;
const listeningCardClass = `lingo-card block min-w-0 !border-[#99F2DF] !bg-[#E9FFF9] ${interactiveHomeCardClass} hover:!border-[#5EE6CA] hover:!bg-[#D5FFF4]`;
const readingCardClass = `lingo-card block min-w-0 !border-[#FFD18A] !bg-[#FFF7E8] ${interactiveHomeCardClass} hover:!border-[#FFB84D] hover:!bg-[#FFECC7]`;

const vocabularyStatCardClass =
  "lingo-card !border-[#C7F8A1] !bg-[#F3FFE8]";
const listeningStatCardClass =
  "lingo-card !border-[#99F2DF] !bg-[#E9FFF9]";
const readingStatCardClass =
  "lingo-card !border-[#FFD18A] !bg-[#FFF7E8]";
const tipCardClass = "lingo-card !border-[#FFE89B] !bg-[#FFF8E0]";

const vocabularyIconClass = "border-[#C7F8A1] bg-[#E5FFC2] text-[#3D7400]";
const listeningIconClass = "border-[#99F2DF] bg-[#D5FFF4] text-[#008E70]";
const readingIconClass = "border-[#FFD18A] bg-[#FFECC7] text-[#A85F00]";

function getInitialHeroGif() {
  try {
    const storedGif = window.localStorage.getItem(HERO_GIF_STORAGE_KEY);
    return HERO_GIFS.includes(storedGif) ? storedGif : DEFAULT_HERO_GIF_URL;
  } catch {
    return DEFAULT_HERO_GIF_URL;
  }
}

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

function EmptyCard({ icon, title, desc, to, action, cardClass = "lingo-card", iconClass = vocabularyIconClass }) {
  return (
    <div className={`${cardClass} p-6 text-center`}>
      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 ${iconClass}`}>
        <AnimatedIcon name={icon} className="h-6 w-6" />
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
  const [selectedHeroGif, setSelectedHeroGif] = useState(getInitialHeroGif);
  const [isHeroGifDialogOpen, setIsHeroGifDialogOpen] = useState(false);

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

  const handleSelectHeroGif = (gifUrl) => {
    setSelectedHeroGif(gifUrl);
    setIsHeroGifDialogOpen(false);

    try {
      window.localStorage.setItem(HERO_GIF_STORAGE_KEY, gifUrl);
    } catch {
      // localStorage may be unavailable in restricted browser modes.
    }

  };

  const recentSets = [...mySets].reverse().slice(0, 6);
  const recentListening = [...listeningLessons].reverse().slice(0, 6);
  const recentReading = [...readingLessons].reverse().slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className={`${heroCardClass} flex min-h-full flex-col justify-center p-6 md:p-8`}>
              <div className="min-w-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[#C7F8A1] bg-[#E5FFC2] px-4 py-2 text-sm font-extrabold uppercase tracking-[0.8px] text-[#3D7400]">
                <AnimatedIcon name="flame" className="h-4 w-4" />
                Sẵn sàng học tiếp
              </div>
              <h1 className="mb-4 text-3xl font-black leading-tight tracking-[-0.3px] text-foreground md:text-5xl">
                Chào {displayName}, hôm nay mình học gì?
              </h1>
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
            </div>

            <div className="grid min-h-full gap-4 grid-rows-[1fr_auto]">
              <AlertDialog open={isHeroGifDialogOpen} onOpenChange={setIsHeroGifDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="group relative block h-full w-full overflow-hidden rounded-2xl border-2 border-[#C7F8A1] bg-white shadow-[0_4px_0_#C7F8A1] transition-all duration-100 hover:-translate-y-0.5 hover:border-[#9BE765] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C7F8A1] active:translate-y-0.5"
                    aria-label="Đổi ảnh chào mừng"
                  >
                    <img
                      src={selectedHeroGif}
                      alt="Ảnh chào mừng học tập"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-[#C7F8A1] bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.6px] text-[#58A700] shadow-sm transition-colors group-hover:bg-[#E5FFC2]">
                      Đổi ảnh
                    </span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Chọn ảnh chào mừng</AlertDialogTitle>
                    <AlertDialogDescription>
                      Chọn một ảnh để hiển thị trong khối chào mừng.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {HERO_GIFS.map((gifUrl, index) => {
                      const isSelected = gifUrl === selectedHeroGif;

                      return (
                        <button
                          key={gifUrl}
                          type="button"
                          onClick={() => handleSelectHeroGif(gifUrl)}
                          className={`relative overflow-hidden rounded-2xl border-2 bg-white p-2 transition-all duration-100 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C7F8A1] active:translate-y-0.5 ${
                            isSelected
                              ? "border-[#58CC03] shadow-[0_4px_0_#58A700]"
                              : "border-border shadow-[0_3px_0_#E5E5E5] hover:border-[#C7F8A1]"
                          }`}
                          aria-label={`Chọn ảnh chào mừng ${index + 1}`}
                        >
                          <img
                            src={gifUrl}
                            alt={`Lựa chọn ảnh chào mừng ${index + 1}`}
                            className="aspect-square w-full rounded-xl object-contain"
                          />
                          {isSelected ? (
                            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-sm">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="grid grid-cols-3 gap-3">
                <div className={`${vocabularyStatCardClass} p-3 text-center`}>
                  <AnimatedIcon name="vocabulary" className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xl font-black text-foreground">{mySets.length}</p>
                  <p className="text-[11px] font-bold text-muted-foreground">Bộ từ vựng</p>
                </div>
                <div className={`${listeningStatCardClass} p-3 text-center`}>
                  <AnimatedIcon name="listening" className="mx-auto mb-1 h-5 w-5 text-[#00CD9C]" />
                  <p className="text-xl font-black text-foreground">{listeningLessons.length}</p>
                  <p className="text-[11px] font-bold text-muted-foreground">Bài nghe</p>
                </div>
                <div className={`${readingStatCardClass} p-3 text-center`}>
                  <AnimatedIcon name="reading" className="mx-auto mb-1 h-5 w-5 text-[#FF9600]" />
                  <p className="text-xl font-black text-foreground">{readingLessons.length}</p>
                  <p className="text-[11px] font-bold text-muted-foreground">Bài đọc</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className={`${tipCardClass} p-6`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#FFE89B] bg-[#FFF8E0] text-[#8A6F00]">
                  <AnimatedIcon name="lightbulb" className="h-6 w-6" />
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
                  <Link key={path} to={path} className={`lingo-card card-hover block p-5 ${MODULE_CARD_CLASSES[path]}`}>
                    <AnimatedIcon name={Icon} className={`mb-4 h-7 w-7 ${color}`} />
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
                  <Link key={set.id} to={`/vocabulary?set=${set.id}`} className={`${vocabularyCardClass} p-5`}>
                    <AnimatedIcon name="vocabulary" className="mb-4 h-7 w-7 text-primary" />
                    <h3 className="line-clamp-2 text-base font-black leading-snug text-foreground">{set.title}</h3>
                    <p className="mt-3 text-sm font-bold text-muted-foreground">{set.wordCount || 0} từ</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyCard
                icon="sparkles"
                title="Chưa có bộ từ nào"
                desc="Tạo bộ từ đầu tiên hoặc để AI gợi ý nội dung theo chủ đề bạn cần học."
                to="/vocabulary"
                cardClass={vocabularyCardClass}
                iconClass={vocabularyIconClass}
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
                    <Link key={lesson.id} to="/listening" className={`${listeningCardClass} p-5`}>
                      <AnimatedIcon name="listening" className="mb-4 h-7 w-7 text-[#00CD9C]" />
                      <h3 className="line-clamp-2 text-base font-black leading-snug text-foreground">{lesson.title}</h3>
                      <span className={`mt-4 inline-flex rounded-xl border-2 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.6px] ${LEVEL_BADGE[lesson.level] || LEVEL_BADGE.beginner}`}>
                        {LEVEL_LABELS[lesson.level] || "Cơ bản"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyCard
                  icon="listening"
                  title="Chưa có bài nghe"
                  desc="Tạo bài nghe theo chủ đề hoặc bắt đầu từ các bài có sẵn."
                  to="/listening"
                  cardClass={listeningCardClass}
                  iconClass={listeningIconClass}
                  action="Mở luyện nghe"
                />
              )}
            </div>

            <div>
              <SectionHeader title="Luyện đọc" to="/reading" />
              {recentReading.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {recentReading.map((lesson) => (
                    <Link key={lesson.id} to="/reading" className={`${readingCardClass} p-5`}>
                      <AnimatedIcon name="reading" className="mb-4 h-7 w-7 text-[#FF9600]" />
                      <h3 className="line-clamp-2 text-base font-black leading-snug text-foreground">{lesson.title}</h3>
                      <span className={`mt-4 inline-flex rounded-xl border-2 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.6px] ${LEVEL_BADGE[lesson.level] || LEVEL_BADGE.beginner}`}>
                        {LEVEL_LABELS[lesson.level] || "Cơ bản"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyCard
                  icon="reading"
                  title="Chưa có bài đọc"
                  desc="Tạo bài đọc mới theo cấp độ để luyện đọc hiểu và mở rộng từ vựng."
                  to="/reading"
                  cardClass={readingCardClass}
                  iconClass={readingIconClass}
                  action="Mở luyện đọc"
                />
              )}
            </div>
          </section>

          <section className={`${ctaCardClass} p-6 md:p-8`}>
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <AnimatedIcon name="trophy" className="h-8 w-8 text-[#FFC800]" />
                  <h2 className="text-2xl font-black">Hoàn thành mục tiêu nhỏ hôm nay</h2>
                </div>
                <p className="max-w-2xl text-[17px] font-medium leading-relaxed text-muted-foreground">
                  Làm một game từ vựng, một bài nghe ngắn hoặc một bài đọc để giữ mạch học tập.
                </p>
              </div>
              <Link to="/leaderboard" className="lingo-button-brand text-sm">
                Xem xếp hạng
                <AnimatedIcon name="moderation" className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer className="mt-auto border-t-2 border-border bg-white" />
    </div>
  );
}
