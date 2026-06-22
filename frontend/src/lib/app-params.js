const isNode = typeof window === "undefined";
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

// Chuyển camelCase sang snake_case
const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};

// Lấy giá trị tham số từ URL hoặc localStorage
const getAppParamValue = (
  paramName,
  { defaultValue = undefined, removeFromUrl = false } = {},
) => {
  if (isNode) {
    return defaultValue;
  }
  const storageKey = `englishup_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? `?${urlParams.toString()}` : ""
    }${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }
  return null;
};

// -------------------------------------------------------
// Xử lý redirect sau khi đăng nhập Google OAuth thành công.
// Backend redirect về /home?access_token=...&expires_at=...
// Ta đọc, lưu vào localStorage và xóa khỏi URL.
// -------------------------------------------------------
const handleGoogleOAuthRedirect = () => {
  if (isNode) return;
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get("access_token");
  const expiresAt = urlParams.get("expires_at");

  if (accessToken) {
    storage.setItem("englishup_access_token", accessToken);
    if (expiresAt) {
      storage.setItem("englishup_token_expires_at", expiresAt);
    }

    // Xóa token khỏi URL để không lộ trong history
    urlParams.delete("access_token");
    urlParams.delete("expires_at");
    const cleanUrl = `${window.location.pathname}${
      urlParams.toString() ? `?${urlParams.toString()}` : ""
    }${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

// Chạy ngay khi module được load
handleGoogleOAuthRedirect();

// Lấy tất cả tham số cấu hình ứng dụng
const getAppParams = () => {
  if (getAppParamValue("clear_access_token") === "true") {
    storage.removeItem("englishup_access_token");
    storage.removeItem("token");
  }
  return {
    appId: getAppParamValue("app_id", {
      defaultValue: import.meta.env.VITE_APP_ID,
    }),
    token: getAppParamValue("access_token", { removeFromUrl: true }),
    fromUrl: getAppParamValue("from_url", {
      defaultValue: window.location.href,
    }),
    functionsVersion: getAppParamValue("functions_version", {
      defaultValue: import.meta.env.VITE_FUNCTIONS_VERSION,
    }),
    appBaseUrl: getAppParamValue("app_base_url", {
      defaultValue: import.meta.env.VITE_APP_BASE_URL,
    }),
    supabaseUrl: getAppParamValue("supabase_url", {
      defaultValue: import.meta.env.VITE_SUPABASE_URL,
    }),
    supabaseAnonKey: getAppParamValue("supabase_anon_key", {
      defaultValue: import.meta.env.VITE_SUPABASE_ANON_KEY,
    }),
  };
};

export const appParams = {
  ...getAppParams(),
};
