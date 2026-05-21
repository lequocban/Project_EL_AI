import { Link } from "react-router-dom";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border px-6 py-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Giới thiệu */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-foreground">EnglishUp</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Nền tảng học tiếng Anh toàn diện với AI - giúp bạn tiến bộ mỗi ngày qua từ vựng, ngữ pháp, luyện nghe, đọc và thi TOEIC.
          </p>
        </div>

        {/* Tính năng */}
        <div className="flex flex-col">
          <h3 className="font-black text-foreground mb-3">Tính năng</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/vocabulary" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Từ vựng
              </Link>
            </li>
            <li>
              <Link to="/grammar" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Ngữ pháp
              </Link>
            </li>
            <li>
              <Link to="/listening" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Luyện nghe
              </Link>
            </li>
            <li>
              <Link to="/reading" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Luyện đọc
              </Link>
            </li>
            <li>
              <Link to="/toeic" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Luyện thi TOEIC
              </Link>
            </li>
          </ul>
        </div>

        {/* Về chúng tôi */}
        <div className="flex flex-col">
          <h3 className="font-black text-foreground mb-3">Về chúng tôi</h3>
          <ul className="space-y-2">
            <li className="text-sm text-muted-foreground font-medium">
              Đội ngũ EnglishUp
            </li>
            <li className="text-sm text-muted-foreground font-medium">
              Mục tiêu: Giúp người Việt học tiếng Anh hiệu quả
            </li>
            <li className="text-sm text-muted-foreground font-medium">
              Phát triển với đam mê tại Việt Nam
            </li>
          </ul>
        </div>

        {/* Thông tin liên hệ */}
        <div className="flex flex-col">
          <h3 className="font-black text-foreground mb-3">Liên hệ</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground font-medium break-all">
                quocban2211@gmail.com
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground font-medium">
                0973 639 706
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground font-medium">
                7/14/10, đường 182, phường Tăng Nhơn Phú A, Thành phố Thủ Đức, TP.HCM, Việt Nam
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto pt-4 border-t border-border text-center">
        <p className="text-muted-foreground text-sm font-medium">
          © 2026 EnglishUp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
