import { Outlet, Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";

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

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border fixed h-full z-20">
        <div className="p-6">
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-foreground">
              EnglishUp
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 pb-4 flex flex-col justify-between">
          <div className="space-y-1">
            {navItems.map(({ path, label, icon: Icon, activeClass }) => {
              const active =
                location.pathname === path || location.pathname.startsWith(`${path}/`);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    active
                      ? `bg-gradient-to-r ${activeClass} text-white shadow-md`
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black">EnglishUp</span>
        </Link>
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
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
                    active
                      ? `bg-gradient-to-r ${activeClass} text-white`
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
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
