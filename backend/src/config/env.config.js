const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseKey: process.env.SUPABASE_KEY || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  // Email config for OTP & reset password
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  // OTP config
  otpExpiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES || "5", 10),
  otpLength: parseInt(process.env.OTP_LENGTH || "6", 10),
  // Frontend URL for OAuth redirects
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  // Backend URL (dùng để build redirectTo cho Google OAuth callback)
  backendUrl: process.env.BACKEND_URL || "http://localhost:3000",
};

module.exports = env;
