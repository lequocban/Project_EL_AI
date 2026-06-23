import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import AnimatedIcon from "@/components/ui/animated-icon";
import {
  isNavigationPrevented,
  resetNavigating,
  triggerNavigationConfirm,
  useNavigationGuardListener,
} from "@/lib/navigationGuard";

const navItems = [
  { path: "/home", label: "Trang chủ", icon: "home" },
  { path: "/vocabulary", label: "Từ vựng", icon: "vocabulary" },
  { path: "/lookup", label: "Tra cứu", icon: "lookup" },
  { path: "/listening", label: "Luyện nghe", icon: "listening" },
  { path: "/reading", label: "Luyện đọc", icon: "reading" },
  { path: "/moderation", label: "Kiểm duyệt", icon: "moderation" },
  { path: "/stats", label: "Thống kê", icon: "progress" },
  { path: "/leaderboard", label: "Xếp hạng", icon: "stats" },
  { path: "/profile", label: "Hồ sơ", icon: "profile" },
];

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

  useNavigationGuardListener(() => {
    setShowExitConfirm(true);
  });

  const renderNavItem = ({ path, label, icon }) => {
    const active = location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
      <a
        key={path}
        href={path}
        onClick={(e) => {
          setMobileOpen(false);
          handleNavClick(e, path);
        }}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold transition-all ${
          active
            ? "border-2 border-transparent bg-primary text-white shadow-[0_4px_0_var(--shadow-brand)]"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <AnimatedIcon name={icon} className="h-5 w-5" />
        {label}
      </a>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed z-20 hidden h-full w-64 flex-col border-r-2 border-border bg-white lg:flex">
        <div className="p-6">
          <a href="/home" onClick={(e) => handleNavClick(e, "/home")} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_4px_0_var(--shadow-brand)]">
              <AnimatedIcon name="brand" className="h-5 w-5" />
            </div>
            <span className="text-xl font-black text-foreground">EnglishUp</span>
          </a>
        </div>
        <nav className="flex-1 space-y-2 px-3 pb-4">{navItems.map(renderNavItem)}</nav>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b-2 border-border bg-white px-4 py-3 lg:hidden">
        <a href="/home" onClick={(e) => handleNavClick(e, "/home")} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_3px_0_var(--shadow-brand)]">
            <AnimatedIcon name="brand" className="h-4 w-4" />
          </div>
          <span className="text-lg font-black">EnglishUp</span>
        </a>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border-2 border-border bg-white p-2 text-foreground shadow-[0_2px_0_rgb(229_229_229_/_1)]"
          aria-label="Mở điều hướng"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-72 space-y-2 border-r-2 border-border bg-white p-4 pt-20" onClick={(e) => e.stopPropagation()}>
            {navItems.map(renderNavItem)}
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="lingo-card-lg w-full max-w-sm p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF8E0] text-[#8A6F00]">
              <AnimatedIcon name="brand" className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-xl font-black text-foreground">Xác nhận thoát</h2>
            <p className="mb-6 text-sm font-medium leading-relaxed text-muted-foreground">
              Bạn có chắc muốn thoát? Tiến trình hiện tại sẽ không được lưu.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={handleCancelExit} className="lingo-button-secondary flex-1 px-4 py-3 text-xs">
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-transparent bg-[#FF4B4B] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.8px] text-white shadow-[0_4px_0_var(--shadow-danger)] transition-all duration-100 hover:bg-[#FF7373] active:translate-y-0.5 active:shadow-[0_2px_0_var(--shadow-danger)]"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-64">
        <div className="pt-16 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
