import { useState, useEffect, useRef } from "react";
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
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Xóa thông báo lỗi và thành công
  const resetMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  // Đếm ngược 3 phút khi vào step nhập OTP
  useEffect(() => {
    if (step === "reset" && otpSentTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - otpSentTime) / 1000);
        const remaining = 180 - elapsed;
        if (remaining <= 0) {
          setTimeRemaining(0);
          clearInterval(interval);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, otpSentTime]);

  // Tự động focus ô đầu tiên khi vào step reset
  useEffect(() => {
    if (step === "reset" && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  // Xử lý nhập từng ô OTP
  const handleOtpChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Cập nhật otp vào form
    const otpValue = newDigits.join("");
    setForm((prev) => ({ ...prev, otp: otpValue }));

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Xử lý phím Backspace và các phím điều hướng
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...otpDigits];
      if (newDigits[index]) {
        newDigits[index] = "";
        setOtpDigits(newDigits);
        setForm((prev) => ({ ...prev, otp: newDigits.join("") }));
      } else if (index > 0 && otpRefs.current[index - 1]) {
        otpRefs.current[index - 1].focus();
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        setForm((prev) => ({ ...prev, otp: newDigits.join("") }));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      otpRefs.current[index + 1].focus();
    }
  };

  // Xử lý dán (paste) mã OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtpDigits(digits);
      setForm((prev) => ({ ...prev, otp: pasted }));
      otpRefs.current[5].focus();
    }
  };

  // Xóa OTP khi gửi lại
  const clearOtpInputs = () => {
    setOtpDigits(["", "", "", "", "", ""]);
    setForm((prev) => ({ ...prev, otp: "" }));
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
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
      setOtpSentTime(Date.now());
      setTimeRemaining(180);
      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    resetMessages();
    setIsResending(true);

    try {
      await authApi.requestOtp(form.email);
      setSuccessMsg("Mã OTP mới đã được gửi đến email của bạn");
      setOtpSentTime(Date.now());
      setTimeRemaining(180);
      clearOtpInputs();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  // Format thời gian còn lại thành mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
      setOtpSentTime(null);
      setTimeRemaining(0);
      clearOtpInputs();
      setForm((prev) => ({
        ...prev,
        password: "",
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
                <label className="text-sm font-bold text-foreground mb-3 block text-center">
                  Mã OTP
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  ))}
                </div>
              </div>

              {timeRemaining > 0 ? (
                <div className="text-center text-sm font-medium text-muted-foreground">
                  Mã OTP sẽ hết hạn sau{" "}
                  <span className="text-primary font-bold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Đang gửi lại...
                    </>
                  ) : (
                    "Gửi lại mã OTP"
                  )}
                </button>
              )}

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
                  setOtpSentTime(null);
                  setTimeRemaining(0);
                  clearOtpInputs();
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
