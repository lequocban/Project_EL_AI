import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/api/authApi";

// Trang đăng nhập với các bước đăng nhập, quên mật khẩu và đặt lại mật khẩu
export default function Login() {
  const [step, setStep] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Xóa thông báo lỗi và thành công
  const resetMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  // Xử lý đăng nhập với email và mật khẩu
  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await authApi.login(form.email, form.password);
      window.location.href = "/home";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gửi yêu cầu OTP về email để đặt lại mật khẩu
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await authApi.requestOtp(form.email);
      setSuccessMsg("Mã OTP đã được gửi đến email của bạn");
      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đặt lại mật khẩu với OTP và mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(form.email, form.otp, form.newPassword);
      setSuccessMsg("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setStep("login");
      setForm((prev) => ({
        ...prev,
        password: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-foreground">
              EnglishUp
            </span>
          </Link>
          <h1 className="text-2xl font-black text-foreground">
            {step === "login" && "Đăng nhập"}
            {step === "forgot" && "Quên mật khẩu"}
            {step === "reset" && "Đặt lại mật khẩu"}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {step === "login" && "Mừng bạn trở lại với hành trình học tập"}
            {step === "forgot" && "Nhập email của bạn để nhận mã OTP"}
            {step === "reset" && "Kiểm tra email và nhập mã xác nhận"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-600 text-sm font-medium mb-4">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-medium mb-4">
              {error}
            </div>
          )}

          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Mật khẩu của bạn"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setStep("forgot");
                    resetMessages();
                  }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          )}

          {step === "forgot" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? "Đang xử lý..." : "Gửi mã xác nhận"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  resetMessages();
                }}
                className="w-full bg-muted text-foreground py-3 rounded-xl font-bold hover:bg-muted/80 transition-all"
              >
                Quay lại
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Mã OTP
                </label>
                <input
                  type="text"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  placeholder="Nhập 6 chữ số"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({ ...form, newPassword: e.target.value })
                    }
                    placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-12"
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
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  resetMessages();
                }}
                className="w-full bg-muted text-foreground py-3 rounded-xl font-bold hover:bg-muted/80 transition-all"
              >
                Về đăng nhập
              </button>
            </form>
          )}
        </div>

        {step === "login" && (
          <p className="text-center text-sm text-muted-foreground font-medium mt-6">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Đăng ký
            </Link>
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground mt-3">
          <Link to="/" className="hover:underline">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
