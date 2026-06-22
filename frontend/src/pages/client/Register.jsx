import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Mail, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import { authApi } from "@/api/authApi";

// Trang đăng ký tài khoản với xác thực OTP 2 bước
export default function Register() {
  // ─── Bước hiện tại: "email" | "otp" ──────────────────────────────────────
  const [step, setStep] = useState("email");

  // ─── Dữ liệu form ────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 ô OTP

  // ─── UI state ────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ─── Đếm ngược gửi lại OTP ───────────────────────────────────────────────
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef(null);

  const navigate = useNavigate();
  const otpInputsRef = useRef([]);

  // Khởi đếm ngược khi chuyển sang bước OTP
  const startCountdown = (seconds = 60) => {
    setResendCountdown(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(countdownRef.current), []);

  // ─── Bước 1: Gửi OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.registerRequestOtp(email);
      setSuccessMsg(`Mã OTP đã được gửi đến ${email}`);
      setStep("otp");
      startCountdown(60);
      // Focus vào ô OTP đầu tiên
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Gửi lại OTP ──────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await authApi.registerRequestOtp(email);
      setSuccessMsg("Mã OTP mới đã được gửi. Vui lòng kiểm tra email.");
      setOtp(["", "", "", "", "", ""]);
      startCountdown(60);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Xử lý nhập từng ô OTP ────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // chỉ nhận số
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // chỉ lấy ký tự cuối
    setOtp(newOtp);
    // Auto-focus ô tiếp theo
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    otpInputsRef.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // ─── Bước 2: Hoàn tất đăng ký ─────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register(email, otpString, password, fullName);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── UI helpers ───────────────────────────────────────────────────────────
  const otpFilled = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-foreground">EnglishUp</span>
          </Link>
          <h1 className="text-2xl font-black text-foreground">Tạo tài khoản</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Bắt đầu hành trình học tiếng Anh
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "email"
                  ? "gradient-primary text-white shadow-md"
                  : "bg-green-500 text-white"
              }`}
            >
              {step === "otp" ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <span
              className={`text-xs font-semibold ${
                step === "email" ? "text-foreground" : "text-green-600"
              }`}
            >
              Xác thực Email
            </span>
          </div>

          <div className="h-px w-8 bg-border" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "otp"
                  ? "gradient-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-semibold ${
                step === "otp" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Thông tin tài khoản
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">

          {/* ── BƯỚC 1: Nhập email ── */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Nhập email để nhận mã OTP xác thực tài khoản
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Email đăng ký
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
              </button>

              {/* Divider */}
              <div className="relative flex items-center my-1">
                <div className="flex-grow border-t border-border" />
                <span className="mx-3 text-xs text-muted-foreground font-medium">hoặc</span>
                <div className="flex-grow border-t border-border" />
              </div>

              {/* Nút đăng ký bằng Google */}
              <a
                href="/api/v1/auth/google"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-white hover:bg-gray-50 transition-all font-semibold text-sm text-foreground shadow-sm"
              >
                {/* Google icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Đăng ký bằng Google
              </a>
            </form>
          )}

          {/* ── BƯỚC 2: OTP + Thông tin đăng ký ── */}
          {step === "otp" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Header bước 2 */}
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setSuccessMsg("");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Đổi email
              </button>

              {/* Thông báo gửi OTP thành công */}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  {successMsg}
                </div>
              )}

              {/* OTP Input boxes */}
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">
                  Mã OTP (6 chữ số)
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-12 text-center text-lg font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        digit
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background text-foreground"
                      }`}
                    />
                  ))}
                </div>

                {/* Gửi lại OTP */}
                <div className="flex items-center justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || loading}
                    className="text-xs font-semibold flex items-center gap-1 disabled:opacity-40 text-primary hover:underline transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {resendCountdown > 0
                      ? `Gửi lại sau ${resendCountdown}s`
                      : "Gửi lại OTP"}
                  </button>
                </div>
              </div>

              {/* Họ và tên */}
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Lỗi */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Nút hoàn tất đăng ký */}
              <button
                type="submit"
                disabled={loading || !otpFilled}
                className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? "Đang đăng ký..." : "Hoàn tất đăng ký"}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <a href="#" className="text-primary font-semibold hover:underline">
                  Điều khoản sử dụng
                </a>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground font-medium mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Đăng nhập
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground mt-3">
          <Link to="/" className="hover:underline">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
