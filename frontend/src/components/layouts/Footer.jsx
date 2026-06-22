import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Zap } from "lucide-react";

const FOOTER_LINKS = [
  { to: "/vocabulary", label: "Từ vựng" },
  { to: "/lookup", label: "Tra cứu" },
  { to: "/listening", label: "Luyện nghe" },
  { to: "/reading", label: "Luyện đọc" },
];

export default function Footer({ className = "border-t-2 border-border bg-white" }) {
  return (
    <footer className={`py-8 ${className}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_4px_0_var(--shadow-brand)]">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-black text-foreground">EnglishUp</span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            Nền tảng học tiếng Anh với AI, giúp bạn tiến bộ mỗi ngày qua từ vựng, nghe và đọc.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-base font-black text-foreground">Tính năng</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm font-bold text-muted-foreground hover:text-[#58A700] hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-base font-black text-foreground">Về chúng tôi</h3>
          <ul className="space-y-2 text-sm font-medium leading-relaxed text-muted-foreground">
            <li>Đội ngũ EnglishUp</li>
            <li>Mục tiêu: giúp người Việt học tiếng Anh hiệu quả.</li>
            <li>Phát triển với định hướng học tập bền vững.</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-base font-black text-foreground">Liên hệ</h3>
          <ul className="space-y-3 text-sm font-medium text-muted-foreground">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span className="break-all">quocban2211@gmail.com</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>0973 639 706</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>Thủ Đức, TP.HCM, Việt Nam</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t-2 border-border px-6 pt-5 text-center">
        <p className="text-sm font-bold text-muted-foreground">Copyright 2026 EnglishUp. All rights reserved.</p>
      </div>
    </footer>
  );
}
