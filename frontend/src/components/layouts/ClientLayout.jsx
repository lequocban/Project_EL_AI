import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  BookText,
  Headphones,
  FileText,
  Menu,
  X,
  Zap,
  BarChart2,
  User,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { isNavigationPrevented, triggerNavigationConfirm, resetNavigating, useNavigationGuardListener } from "@/lib/navigationGuard";

const navItems = [
  {
    path: "/home",
    label: "Trang chủ",
    icon: Home,
    activeClass: "from-violet-500 to-indigo-500",
  },
  {
    path: "/vocabulary",
    label: "Từ vựng",
    icon: BookOpen,
    activeClass: "from-violet-500 to-indigo-500",
  },
  {
    path: "/lookup",
    label: "Tra cứu",
    icon: BookText,
    activeClass: "from-blue-500 to-cyan-500",
  },
  {
    path: "/listening",
    label: "Luyện nghe",
    icon: Headphones,
    activeClass: "from-green-500 to-teal-500",
  },
  {
    path: "/reading",
    label: "Luyện đọc",
    icon: FileText,
    activeClass: "from-orange-500 to-amber-500",
  },
  {
    path: "/moderation",
    label: "Kiểm duyệt",
    icon: ShieldCheck,
    activeClass: "from-fuchsia-500 to-purple-600",
  },
  {
    path: "/stats",
    label: "Thống kê",
    icon: TrendingUp,
    activeClass: "from-pink-500 to-rose-500",
  },
  {
    path: "/leaderboard",
    label: "Xếp hạng",
    icon: BarChart2,
    activeClass: "from-teal-500 to-cyan-600",
  },
  {
    path: "/profile",
    label: "Hồ sơ",
    icon: User,
    activeClass: "gradient-primary",
  },
];

// Component bố cục trang client với sidebar và menu mobile
export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    if (isNavigationPrevented()) {
      setPendingPath(path);
      setShowExitConfirm(true);
    } else {
      resetNavigating();
      navigate(path);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    resetNavigating();
    triggerNavigationConfirm();
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingPath(null);
    resetNavigating();
  };

  // Lắng nghe sự kiện từ back/forward button
  useNavigationGuardListener(() => {
    setShowExitConfirm(true);
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border fixed h-full z-20">
        <div className="p-6">
          <a href="/home" onClick={(e) => handleNavClick(e, "/home")} className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-foreground">
              EnglishUp
            </span>
          </a>
        </div>
        <nav className="flex-1 px-3 pb-4 flex flex-col justify-between">
          <div className="space-y-1">
            {navItems.map(({ path, label, icon: Icon, activeClass }) => {
              const active =
                location.pathname === path || location.pathname.startsWith(`${path}/`);
              return (
                <a
                  key={path}
                  href={path}
                  onClick={(e) => handleNavClick(e, path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    active
                      ? `bg-gradient-to-r ${activeClass} text-white shadow-md`
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </a>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <a href="/home" onClick={(e) => handleNavClick(e, "/home")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black">EnglishUp</span>
        </a>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-muted"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white w-64 h-full p-4 pt-16 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map(({ path, label, icon: Icon, activeClass }) => {
              const active =
                location.pathname === path || location.pathname.startsWith(`${path}/`);
              return (
                <a
                  key={path}
                  href={path}
                  onClick={(e) => {
                    setMobileOpen(false);
                    handleNavClick(e, path);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer ${
                    active
                      ? `bg-gradient-to-r ${activeClass} text-white`
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-foreground mb-2">Xác nhận thoát</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn có chắc muốn thoát? Tiến trình hiện tại sẽ không được lưu.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelExit}
                className="flex-1 border border-border py-2.5 rounded-xl font-bold text-sm hover:bg-muted transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-0 lg:pt-0">
        <div className="pt-14 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
