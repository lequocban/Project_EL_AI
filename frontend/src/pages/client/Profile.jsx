import { useState, useEffect } from "react";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/lib/AuthContext";
import { statsApi } from "@/api/client/statsApi";
import { moderationApi } from "@/api/client/moderationApi";
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
  ShieldCheck,
  User,
  X,
} from "lucide-react";

// Chuyển đổi ngày tháng từ API sang định dạng input date
const toInputDate = (value) => {
  if (!value) return "";
  const [day, month, year] = value.includes("/")
    ? value.split("/")
    : value.split("-").reverse();
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Chuyển đổi ngày tháng từ input date sang định dạng API
const toApiDate = (value) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

// Kiểm tra mật khẩu có đủ mạnh không (>=8 ký tự, có chữ hoa và số)
const isStrongPassword = (value) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);


// Trang hồ sơ người dùng với thông tin cá nhân và thống kê
export default function Profile() {
  const { user: authUser, logout, checkUserAuth } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    userName: authUser?.full_name || authUser?.userName || "",
    dayOfBirth: toInputDate(authUser?.dayOfBirth),
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
  const [moderationTotal, setModerationTotal] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [learningStats, modData] = await Promise.all([
          statsApi.getLearningStats(),
          moderationApi.getMyRequests({ limit: 1 }),
        ]);
        setStats(learningStats);
        setModerationTotal(modData.total || 0);
      } catch {
        // fallback
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, []);

  if (!authUser) return null;

  // Mở modal cập nhật hồ sơ với dữ liệu hiện tại
  const openProfileModal = () => {
    setProfileForm({
      userName: authUser.full_name || authUser.userName || "",
      dayOfBirth: toInputDate(authUser.dayOfBirth),
    });
    setProfileStatus({ type: "", message: "" });
    setProfileOpen(true);
  };

  // Mở modal đổi mật khẩu
  const openPasswordModal = () => {
    if (authUser.authProvider === "google") return;
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
      await authApi.updateProfile({
        userName,
        dayOfBirth: toApiDate(profileForm.dayOfBirth),
      });
      await checkUserAuth();
      setProfileStatus({ type: "success", message: "Cập nhật hồ sơ thành công." });
      setProfileOpen(false);
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
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
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
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">👤 Hồ sơ</h1>

        {/* Avatar & Name */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md uppercase">
            {authUser.full_name?.charAt(0) || authUser.email?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              {authUser.full_name || "Chưa cập nhật tên"}
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              {authUser.email}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block bg-primary/10 text-primary`}
            >
              Học viên
            </span>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : (stats?.vocabulary?.ownedCount ?? 0)}
            </p>
            <p className="text-violet-200 text-sm font-semibold">
              Bộ từ vựng
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : (stats?.listening?.ownedCount ?? 0)}
            </p>
            <p className="text-emerald-100 text-sm font-semibold">
              Bài nghe
            </p>
          </div>
          <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <BookText className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : (stats?.reading?.ownedCount ?? 0)}
            </p>
            <p className="text-sky-100 text-sm font-semibold">
              Bài đọc
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">
              {loadingStats ? "..." : moderationTotal}
            </p>
            <p className="text-amber-100 text-sm font-semibold">
              Yêu cầu kiểm duyệt
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${authUser.authProvider === "google" ? "" : "sm:grid-cols-2"} gap-3 mb-4`}>
          <button
            onClick={openProfileModal}
            className="flex items-center justify-center gap-3 gradient-primary text-white rounded-2xl p-4 font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Pencil className="w-5 h-5" />
            Cập nhật hồ sơ
          </button>
          {authUser.authProvider !== "google" && (
            <button
              onClick={openPasswordModal}
              className="flex items-center justify-center gap-3 bg-white border border-border text-foreground rounded-2xl p-4 font-bold hover:bg-muted/40 transition-all"
            >
              <KeyRound className="w-5 h-5 text-primary" />
              Đổi mật khẩu
            </button>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => logout(true)}
          className="w-full flex items-center justify-center gap-3 bg-white border border-red-200 text-red-500 rounded-2xl p-4 font-bold hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-border">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black text-foreground">Cập nhật hồ sơ</h2>
                <p className="text-sm text-muted-foreground font-medium">Thay đổi thông tin cá nhân của bạn</p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted/60 transition-all"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Họ và tên
                </span>
                <input
                  value={profileForm.userName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, userName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </span>
                <input
                  value={authUser.email || ""}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-border bg-muted/60 px-4 py-3 font-semibold text-muted-foreground opacity-70"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Ngày tháng năm sinh
                </span>
                <input
                  type="date"
                  value={profileForm.dayOfBirth}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, dayOfBirth: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="w-full rounded-2xl gradient-primary p-4 font-black text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {savingProfile ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-border">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black text-foreground">Đổi mật khẩu</h2>
                <p className="text-sm text-muted-foreground font-medium">Tăng cường bảo mật tài khoản của bạn</p>
              </div>
              <button
                onClick={() => setPasswordOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted/60 transition-all"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Mật khẩu hiện tại
                </span>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Mật khẩu mới
                </span>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                    placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Xác nhận mật khẩu mới
                </span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                className="w-full rounded-2xl gradient-primary p-4 font-black text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
