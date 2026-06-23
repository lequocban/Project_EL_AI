import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Footer from "@/components/layouts/Footer";
import AnimatedIcon from "@/components/ui/animated-icon";

const FEATURES = [
  {
    icon: "vocabulary",
    title: "Từ vựng thông minh",
    desc: "Tạo bộ từ bằng AI, học bằng flashcard, trắc nghiệm, gõ từ và nghe viết.",
  },
  {
    icon: "listening",
    title: "Luyện nghe chủ động",
    desc: "Nghe hội thoại theo chủ đề, luyện câu hỏi và theo dõi tiến độ từng bài.",
  },
  {
    icon: "reading",
    title: "Luyện đọc có mục tiêu",
    desc: "Đọc bài theo cấp độ, trả lời câu hỏi và mở rộng vốn từ trong ngữ cảnh.",
  },
  {
    icon: "trophy",
    title: "Duy trì động lực",
    desc: "Streak, XP và bảng xếp hạng giúp việc học mỗi ngày có cảm giác rõ ràng.",
  },
];

const STATS = [
  { value: "10K+", label: "Người học" },
  { value: "500+", label: "Bộ từ vựng" },
  { value: "95%", label: "Hài lòng" },
  { value: "4.9", label: "Đánh giá" },
];

const SKILLS = [
  { icon: "vocabulary", title: "Vocabulary", color: "text-primary" },
  { icon: "listening", title: "Listening", color: "text-[#1CB0F6]" },
  { icon: "reading", title: "Reading", color: "text-[#FF9600]" },
  { icon: "stats", title: "Progress", color: "text-[#CE82FF]" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-30 border-b-2 border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_4px_0_var(--shadow-brand)]">
              <AnimatedIcon name="brand" className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">EnglishUp</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-3 text-sm font-extrabold uppercase tracking-[0.8px] text-foreground transition-colors hover:bg-muted"
            >
              Đăng nhập
            </Link>
            <Link to="/register" className="lingo-button-brand px-5 py-3">
              Bắt đầu
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="border-b-2 border-border bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[#C7F8A1] bg-[#E5FFC2] px-4 py-2 text-sm font-extrabold uppercase tracking-[0.8px] text-[#3D7400]">
                <AnimatedIcon name="flame" className="h-4 w-4" />
                Học đều mỗi ngày
              </div>
              <h1 className="mb-6 max-w-3xl text-[40px] font-black leading-[1.08] tracking-[-0.4px] text-foreground md:text-5xl lg:text-6xl">
                Học tiếng Anh dễ nhớ hơn, vui hơn và có tiến độ thật.
              </h1>
              <p className="mb-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-[19px]">
                EnglishUp gồm từ vựng, nghe, đọc, AI tạo bài học và gamification vào một không gian học gọn gàng cho người Việt.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/register" className="lingo-button-brand text-base">
                  Bắt đầu miễn phí
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link to="/login" className="lingo-button-secondary text-base">
                  Tôi đã có tài khoản
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Không cần thẻ tín dụng
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Học trên mọi thiết bị
                </span>
              </div>
            </div>

            <div className="lingo-card-lg p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between border-b-2 border-border pb-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.8px] text-muted-foreground">
                    Hôm nay
                  </p>
                  <h2 className="text-2xl font-black text-foreground">15 phút học tập</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#C7F8A1] bg-[#E5FFC2] text-[#3D7400]">
                  <AnimatedIcon name="sparkles" className="h-6 w-6" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {SKILLS.map(({ icon: Icon, title, color }) => (
                  <div key={title} className="rounded-xl border-2 border-border bg-white p-4 shadow-[0_2px_0_rgb(229_229_229_/_1)]">
                    <AnimatedIcon name={Icon} className={`mb-4 h-7 w-7 ${color}`} />
                    <p className="text-lg font-black text-foreground">{title}</p>
                    <div className="mt-4 h-3 rounded-full border-2 border-border bg-muted">
                      <div className="h-full w-2/3 rounded-full bg-primary" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border-2 border-border bg-white p-4 shadow-[0_2px_0_rgb(229_229_229_/_1)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.8px] text-[#58A700]">
                      Streak đang chạy
                    </p>
                    <p className="text-2xl font-black">7 ngày liên tiếp</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC800] text-[#4B4B4B] shadow-[0_4px_0_#E6B400]">
                    <AnimatedIcon name="brand" className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-border bg-white px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <h2 className="mb-4 text-3xl font-black tracking-[-0.3px] md:text-4xl">
                Tất cả kỹ năng trong một luồng học.
              </h2>
              <p className="text-[17px] font-medium leading-relaxed text-muted-foreground">
                Mỗi khối học được thiết kế như một bài tập ngắn, rõ mục tiêu và có phần thưởng tiến độ.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="lingo-card p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#C7F8A1] bg-[#E5FFC2] text-[#3D7400]">
                    <AnimatedIcon name={Icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-black text-foreground">{title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b-2 border-border bg-white px-6 py-16 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-black tracking-[-0.3px] md:text-4xl">
                Nhìn thấy tiến độ sau từng buổi học.
              </h2>
              <p className="text-[17px] font-medium leading-relaxed text-muted-foreground">
                Trang học tập gồm thống kê, bài gần đây và module tiếp theo để người học quay lại đúng việc cần làm.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="lingo-card p-5 text-center">
                  <p className="text-3xl font-black text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm font-bold text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-16 text-center lg:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="lingo-card-lg p-8 md:p-10">
              <AnimatedIcon name="layers" className="mx-auto mb-5 h-10 w-10 text-primary" />
              <h2 className="mb-4 text-3xl font-black tracking-[-0.3px] md:text-4xl">
                Sẵn sàng xây thói quen học mỗi ngày?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-[17px] font-medium leading-relaxed text-muted-foreground">
                Tạo tài khoản miễn phí và bắt đầu với từ vựng, nghe hoặc đọc trong vài phút.
              </p>
              <Link to="/register" className="lingo-button-brand text-base">
                Đăng ký ngay
                <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer className="mt-auto border-t-2 border-border bg-white" />
    </div>
  );
}
