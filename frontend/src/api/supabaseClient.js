import { createClient } from "@supabase/supabase-js";

// Hàm lấy environment variable an toàn
const getEnv = (key) => {
  try {
    return import.meta.env[key] || "";
  } catch {
    return "";
  }
};

// Lấy credentials từ environment
const supabaseUrl = getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY");

// Chỉ tạo Supabase client khi có đủ credentials
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
    console.log("Supabase client initialized successfully");
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    supabase = null;
  }
} else {
  console.warn("Supabase credentials not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local");
}

export default supabase;
