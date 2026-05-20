import { Link } from "react-router-dom";
import { Zap, Flame, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: "📚",
    title: "Từ vựng thông minh",
    desc: "Học từ vựng qua Flashcard, Trắc nghiệm, Gõ từ, Nghe viết. AI tạo bộ từ theo chủ đề bạn muốn.",
  },
  {
    icon: "✏️",
    title: "Ngữ pháp hệ thống",
    desc: "Các bài học ngữ pháp từ cơ bản đến nâng cao, dễ hiểu với ví dụ minh họa thực tế.",
  },
  {
    icon: "🎧",
    title: "Luyện nghe",
    desc: "Bài nghe đa dạng chủ đề. AI tạo hội thoại theo yêu cầu với công nghệ Text-to-Speech.",
  },
  {
    icon: "📖",
    title: "Luyện đọc",
    desc: "Đoạn văn phong phú kèm câu hỏi đọc hiểu. Tạo bài đọc mới bằng AI ngay trong ứng dụng.",
  },
  {
    icon: "🏆",
    title: "Luyện thi TOEIC",
    desc: "Đề thi mô phỏng đầy đủ Part 1-7 với giải thích chi tiết và điểm số ước tính.",
  },
  {
    icon: "🔥",
    title: "Gamification",
    desc: "Hệ thống Streak, XP và bảng xếp hạng giúp bạn duy trì động lực học mỗi ngày.",
  },
];

const STATS = [
  { value: "10,000+", label: "Người học" },
  { value: "500+", label: "Bộ từ vựng" },
  { value: "95%", label: "Hài lòng" },
  { value: "4.9★", label: "Đánh giá" },
];

const SHOWCASES = [
  {
    img: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600",
    title: "📚 Flashcard thông minh",
    desc: "Học từ vựng qua trò chơi tương tác vui nhộn",
  },
  {
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    title: "🎧 Luyện nghe & đọc",
    desc: "Bài nghe đa dạng chủ đề với AI tạo nội dung",
  },
  {
    img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600",
    title: "🏆 Luyện thi TOEIC",
    desc: "Đề thi mô phỏng với điểm số ước tính chi tiết",
  },
];

const gradientText = {
  background: "linear-gradient(135deg, hsl(262,83%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  display: "inline-block",
};

// Trang giới thiệu sản phẩm cho người dùng chưa đăng nhập
export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-foreground">EnglishUp</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="gradient-primary text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition-all"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 lg:py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
          <Flame className="w-4 h-4 text-orange-500" /> #1 Ứng dụng học tiếng
          Anh hiệu quả
        </div>
        <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
          Học tiếng Anh
          <br />
          <span style={gradientText}>thông minh hơn</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium mb-8 max-w-2xl mx-auto">
          Nền tảng học tiếng Anh toàn diện với AI — từ từ vựng, ngữ pháp, luyện
          nghe, đọc đến luyện thi TOEIC. Học mỗi ngày, tiến bộ mỗi ngày.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="gradient-primary text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            Bắt đầu miễn phí <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="bg-white border-2 border-border text-foreground font-black text-lg px-8 py-4 rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-2"
          >
            Đăng nhập
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Miễn phí hoàn toàn • Không cần thẻ tín dụng
        </p>
      </section>

      {/* Showcase images */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SHOWCASES.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden shadow-lg border border-border card-hover group"
            >
              <div className="overflow-hidden h-44">
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-white p-4">
                <p className="font-black text-sm text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-border py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-primary">{s.value}</p>
              <p className="text-muted-foreground font-semibold text-sm mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-foreground text-center mb-2">
          Tất cả trong một
        </h2>
        <p className="text-muted-foreground text-center font-medium mb-10">
          Mọi kỹ năng tiếng Anh bạn cần
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-border card-hover"
            >
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-black text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm font-medium">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-foreground text-center mb-10">
            Bắt đầu chỉ trong 3 bước
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Tạo tài khoản",
                desc: "Đăng ký miễn phí bằng email hoặc tài khoản Google.",
              },
              {
                step: "2",
                title: "Chọn kỹ năng",
                desc: "Học từ vựng, ngữ pháp, luyện nghe/đọc hoặc ôn thi TOEIC theo nhu cầu.",
              },
              {
                step: "3",
                title: "Học mỗi ngày",
                desc: "Duy trì streak, tích XP và leo bảng xếp hạng cùng cộng đồng.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-black text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-xl mx-auto gradient-primary rounded-3xl p-10 text-white shadow-2xl">
          <h2 className="text-3xl font-black mb-3">Sẵn sàng bắt đầu?</h2>
          <p className="text-white/80 font-medium mb-6">
            Tham gia hàng nghìn học viên đang tiến bộ mỗi ngày với EnglishUp.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary font-black text-lg px-8 py-4 rounded-2xl hover:bg-white/90 transition-all inline-flex items-center gap-2 shadow-xl"
          >
            Đăng ký ngay <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-foreground">EnglishUp</span>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          © 2026 EnglishUp. Học tiếng Anh hiệu quả mỗi ngày.
        </p>
      </footer>
    </div>
  );
}
