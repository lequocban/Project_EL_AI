import { useState } from "react";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/lib/AuthContext";
import {
  BookOpen,
  Calendar,
  Flame,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";

const toInputDate = (value) => {
  if (!value) return "";
  const [day, month, year] = value.includes("/")
    ? value.split("/")
    : value.split("-").reverse();
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const toApiDate = (value) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const isStrongPassword = (value) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);


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

  if (!authUser) return null;

  const openProfileModal = () => {
    setProfileForm({
      userName: authUser.full_name || authUser.userName || "",
      dayOfBirth: toInputDate(authUser.dayOfBirth),
    });
    setProfileStatus({ type: "", message: "" });
    setProfileOpen(true);
  };

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordStatus({ type: "", message: "" });
    setPasswordOpen(true);
  };

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
      <div className="max-w-lg mx-auto">
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-4 text-white shadow-md">
            <Flame className="w-6 h-6 mb-2" />
            <p className="text-3xl font-black">0</p>
            <p className="text-orange-100 text-sm font-semibold">
              Chuỗi hiện tại (Chưa có dữ liệu)
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
            <Zap className="w-6 h-6 text-yellow-300 mb-2" />
            <p className="text-3xl font-black">0</p>
            <p className="text-violet-200 text-sm font-semibold">Tổng XP (Chưa có dữ liệu)</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <BookOpen className="w-6 h-6 text-primary mb-2" />
            <p className="text-3xl font-black text-foreground">
              0
            </p>
            <p className="text-muted-foreground text-sm font-semibold">
              Bộ từ vựng (Chưa có dữ liệu)
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <Star className="w-6 h-6 text-yellow-500 mb-2" />
            <p className="text-3xl font-black text-foreground">
              0
            </p>
            <p className="text-muted-foreground text-sm font-semibold">
              Streak dài nhất (Chưa có dữ liệu)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={openProfileModal}
            className="flex items-center justify-center gap-3 gradient-primary text-white rounded-2xl p-4 font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Pencil className="w-5 h-5" />
            Cập nhật hồ sơ
          </button>
          <button
            onClick={openPasswordModal}
            className="flex items-center justify-center gap-3 bg-white border border-border text-foreground rounded-2xl p-4 font-bold hover:bg-muted/40 transition-all"
          >
            <KeyRound className="w-5 h-5 text-primary" />
            Đổi mật khẩu
          </button>
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
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Mật khẩu mới
                </span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Xác nhận mật khẩu mới
                </span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Nhập lại mật khẩu mới"
                />
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
