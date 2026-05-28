import { useState, useEffect } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { adminApi } from "@/api/admin";
import {
  BookOpen,
  BookText,
  Calendar,
  Eye,
  EyeOff,
  Headphones,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Shield,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

// Chuyển đổi ngày tháng từ API (DD/MM/YYYY) sang định dạng input date (YYYY-MM-DD)
const toInputDate = (value) => {
  if (!value) return "";
  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return value;
};

// Chuyển đổi ngày tháng từ input date (YYYY-MM-DD) sang định dạng API (DD/MM/YYYY)
const toApiDate = (value) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

// Kiểm tra mật khẩu có đủ mạnh không (>=8 ký tự, có chữ hoa và số)
const isStrongPassword = (value) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);

// Ánh xạ role ID sang nhãn hiển thị
const getRoleLabel = (roleId) => {
  switch (Number(roleId)) {
    case 1:
      return { label: "Người dùng", color: "bg-blue-100 text-blue-700" };
    case 2:
      return { label: "Quản lý nội dung", color: "bg-violet-100 text-violet-700" };
    case 3:
      return { label: "Quản trị viên", color: "bg-amber-100 text-amber-700" };
    default:
      return { label: "Không xác định", color: "bg-gray-100 text-gray-700" };
  }
};

// Lấy icon cho vai trò
const getRoleIcon = (roleId) => {
  switch (Number(roleId)) {
    case 1:
      return User;
    case 2:
      return Shield;
    case 3:
      return ShieldCheck;
    default:
      return Shield;
  }
};

// Trang hồ sơ admin với thông tin cá nhân, vai trò và thống kê hệ thống
export default function AdminProfile() {
  const { admin, logout } = useAdminAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    userName: admin?.user?.username || admin?.user?.userName || admin?.full_name || "",
    dayOfBirth: toInputDate(admin?.user?.dayOfBirth),
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Sync profileForm khi admin được set (fix trường hợp admin null lúc mount)
  useEffect(() => {
    if (admin) {
      setProfileForm({
        userName: admin?.user?.username || admin?.user?.userName || admin?.full_name || "",
        dayOfBirth: toInputDate(admin?.user?.dayOfBirth),
      });
    }
  }, [admin]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data.data || {});
      } catch {
        // fallback
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Return loading nếu admin chưa ready (đặt SAU hooks theo đúng rules)
  if (!admin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Lấy danh sách roles từ admin context
  const roles = (admin?.user?.roles || []).map(Number);

  // Mở modal cập nhật hồ sơ với dữ liệu hiện tại
  const openProfileModal = () => {
    setProfileForm({
      userName: admin?.user?.username || admin?.user?.userName || admin?.full_name || "",
      dayOfBirth: toInputDate(admin?.user?.dayOfBirth),
    });
    setProfileStatus({ type: "", message: "" });
    setProfileOpen(true);
  };

  // Mở modal đổi mật khẩu
  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordStatus({ type: "", message: "" });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordOpen(true);
  };

  // Xử lý cập nhật hồ sơ người dùng
  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const userName = profileForm.userName.trim();
    if (userName.length < 2) {
      setProfileStatus({ type: "error", message: "Họ và tên phải có ít nhất 2 ký tự." });
      return;
    }

    try {
      setSavingProfile(true);
      setProfileStatus({ type: "", message: "" });
      await adminApi.updateProfile({
        userName,
        dayOfBirth: toApiDate(profileForm.dayOfBirth),
      });
      // Tải lại thông tin admin
      const response = await adminApi.getMe();
      // Cập nhật lại admin trong context thông qua reload
      window.location.reload();
    } catch (error) {
      setProfileStatus({ type: "error", message: error.message || "Cập nhật hồ sơ thất bại." });
    } finally {
      setSavingProfile(false);
    }
  };

  // Xử lý đổi mật khẩu người dùng
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!isStrongPassword(passwordForm.newPassword)) {
      setPasswordStatus({
        type: "error",
        message: "Mật khẩu mới cần tối thiểu 8 ký tự, có ít nhất 1 chữ hoa và 1 chữ số.",
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Xác nhận mật khẩu mới không khớp." });
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordStatus({ type: "", message: "" });
      await adminApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordStatus({ type: "success", message: "Đổi mật khẩu thành công." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordOpen(false);
    } catch (error) {
      setPasswordStatus({ type: "error", message: error.message || "Đổi mật khẩu thất bại." });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-6">Hồ sơ quản trị</h1>

        {/* Avatar, Name & Roles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 flex items-start gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md uppercase flex-shrink-0">
            {(admin?.user?.username || admin?.user?.userName || admin?.full_name || admin?.email || "?")?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-900">
              {admin?.user?.username || admin?.user?.userName || admin?.full_name || "Chưa cập nhật tên"}
            </h2>
            <p className="text-slate-500 text-sm font-medium truncate">
              {admin?.email}
            </p>
            {/* Hiển thị toàn bộ roles */}
            <div className="flex flex-wrap gap-2 mt-2">
              {roles.map((roleId) => {
                const { label, color } = getRoleLabel(roleId);
                const RoleIcon = getRoleIcon(roleId);
                return (
                  <span
                    key={roleId}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 ${color}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl p-4 text-white shadow-md">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : (stats?.vocabularySets?.public ?? 0)}
            </p>
            <p className="text-violet-200 text-sm font-semibold">
              Bộ từ vựng công khai
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 text-white shadow-md">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <BookText className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : (stats?.readingLessons?.public ?? 0)}
            </p>
            <p className="text-emerald-100 text-sm font-semibold">
              Bài đọc công khai
            </p>
          </div>
          <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 text-white shadow-md">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : (stats?.listeningLessons?.public ?? 0)}
            </p>
            <p className="text-sky-100 text-sm font-semibold">
              Bài nghe công khai
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-md">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : (stats?.vocabularySets?.practiceCount ?? 0)}
            </p>
            <p className="text-amber-100 text-sm font-semibold">
              Lượt luyện tập
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={openProfileModal}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl p-4 font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Pencil className="w-5 h-5" />
            Cập nhật hồ sơ
          </button>
          <button
            onClick={openPasswordModal}
            className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 rounded-2xl p-4 font-bold hover:bg-slate-50 transition-all"
          >
            <KeyRound className="w-5 h-5 text-violet-500" />
            Đổi mật khẩu
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-3 bg-white border border-red-200 text-red-500 rounded-2xl p-4 font-bold hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>

      {/* Modal Cập nhật hồ sơ */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">Cập nhật hồ sơ</h2>
                <p className="text-sm text-slate-500 font-medium">Thay đổi thông tin cá nhân của bạn</p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-500" />
                  Họ và tên
                </span>
                <input
                  value={profileForm.userName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, userName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-violet-500" />
                  Email
                </span>
                <input
                  value={admin?.email || ""}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  Ngày tháng năm sinh
                </span>
                <input
                  type="date"
                  value={profileForm.dayOfBirth}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, dayOfBirth: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </label>

              {profileStatus.message && (
                <p
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                    profileStatus.type === "error"
                      ? "bg-red-50 text-red-500 border border-red-100"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}
                >
                  {profileStatus.message}
                </p>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 p-4 font-black text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {savingProfile ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi mật khẩu */}
      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">Đổi mật khẩu</h2>
                <p className="text-sm text-slate-500 font-medium">Tăng cường bảo mật tài khoản của bạn</p>
              </div>
              <button
                onClick={() => setPasswordOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-violet-500" />
                  Mật khẩu hiện tại
                </span>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 pr-12"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-violet-500" />
                  Mật khẩu mới
                </span>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 pr-12"
                    placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-violet-500" />
                  Xác nhận mật khẩu mới
                </span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 pr-12"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              {passwordStatus.message && (
                <p
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                    passwordStatus.type === "error"
                      ? "bg-red-50 text-red-500 border border-red-100"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}
                >
                  {passwordStatus.message}
                </p>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 p-4 font-black text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {savingPassword ? "Đang đổi mật khẩu..." : "Xác nhận đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
