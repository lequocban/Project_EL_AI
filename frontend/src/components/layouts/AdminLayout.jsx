import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BookText,
  Headphones,
  Users,
  LogOut,
  Shield,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";

const adminNavItems = [
  {
    path: "/admin/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    path: "/admin/vocabulary",
    label: "Từ vựng",
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    path: "/admin/reading",
    label: "Luyện đọc",
    icon: BookText,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    path: "/admin/listening",
    label: "Luyện nghe",
    icon: Headphones,
    gradient: "from-green-500 to-teal-500",
  },
  {
    path: "/admin/moderation",
    label: "Kiểm duyệt",
    icon: ShieldCheck,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    path: "/admin/users",
    label: "Người dùng",
    icon: Users,
    gradient: "from-pink-500 to-rose-500",
  },
];

// Component bố cục trang admin với sidebar điều hướng và menu mobile
export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // content_manager chỉ thấy 4 mục: Từ vựng, Luyện đọc, Luyện nghe, Kiểm duyệt
  const adminRoles = admin?.user?.roles || [];
  const hasAdminRole = adminRoles.includes(3);
  const navItems = hasAdminRole
    ? adminNavItems
    : adminNavItems.filter(
        item => item.path !== "/admin/dashboard" && item.path !== "/admin/users"
      );

  // Xử lý đăng xuất admin và chuyển hướng về trang đăng nhập
  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white text-slate-900 fixed h-full z-20 shadow-lg shadow-slate-200/50 border-r border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <Link to={hasAdminRole ? "/admin/dashboard" : "/admin/vocabulary"} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900">Admin</span>
              <div className="text-xs text-slate-500 font-medium">
                {hasAdminRole ? "Quản trị viên" : "Quản lý nội dung"}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon, gradient }) => {
            const firstPath = navItems[0]?.path || "/admin/vocabulary";
            const active =
              location.pathname === path ||
              (path !== firstPath && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  active
                    ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          {admin && (
            <div className="px-4 py-2 text-sm">
              <div className="font-bold text-slate-900 truncate">{admin.userName || admin.email}</div>
              <div className="text-xs text-slate-500 truncate">{admin.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white text-slate-900 border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link to={hasAdminRole ? "/admin/dashboard" : "/admin/vocabulary"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-slate-900">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white text-slate-900 w-72 h-full p-4 pt-16 space-y-1 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map(({ path, label, icon: Icon, gradient }) => {
              const firstPath = navItems[0]?.path || "/admin/vocabulary";
              const active =
                location.pathname === path ||
                (path !== firstPath && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
                    active
                      ? `bg-gradient-to-r ${gradient} text-white`
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 mt-4"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
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
