import { Link } from "react-router-dom";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

export default function Footer({ className = "bg-white border-t border-border" }) {
  return (
    <footer className={`py-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
        {/* Giới thiệu */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black">EnglishUp</span>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            Nền tảng học tiếng Anh toàn diện với AI - giúp bạn tiến bộ mỗi ngày qua từ vựng, ngữ pháp, luyện nghe và luyện đọc
          </p>
        </div>

        {/* Tính năng */}
        <div className="flex flex-col">
          <h3 className="font-black mb-2">Tính năng</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/vocabulary" className="text-sm hover:opacity-70 transition-opacity font-medium">
                Từ vựng
              </Link>
            </li>
            <li>
              <Link to="/grammar" className="text-sm hover:opacity-70 transition-opacity font-medium">
                Ngữ pháp
              </Link>
            </li>
            <li>
              <Link to="/listening" className="text-sm hover:opacity-70 transition-opacity font-medium">
                Luyện nghe
              </Link>
            </li>
            <li>
              <Link to="/reading" className="text-sm hover:opacity-70 transition-opacity font-medium">
                Luyện đọc
              </Link>
            </li>
          </ul>
        </div>

        {/* Về chúng tôi */}
        <div className="flex flex-col">
          <h3 className="font-black mb-2">Về chúng tôi</h3>
          <ul className="space-y-2">
            <li className="text-sm font-medium">
              Đội ngũ EnglishUp
            </li>
            <li className="text-sm font-medium">
              Mục tiêu: Giúp người Việt học tiếng Anh hiệu quả
            </li>
            <li className="text-sm font-medium">
              Phát triển với đam mê tại Việt Nam
            </li>
          </ul>
        </div>

        {/* Thông tin liên hệ */}
        <div className="flex flex-col">
          <h3 className="font-black mb-2">Liên hệ</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium break-all">
                quocban2211@gmail.com
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">
                0973 639 706
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">
                7/14/10, đường 182, phường Tăng Nhơn Phú A, Thành phố Thủ Đức, TP.HCM, Việt Nam
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-3 border-t border-border text-center px-6">
        <p className="text-sm font-medium">
          © 2026 EnglishUp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
