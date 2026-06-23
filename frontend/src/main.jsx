import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { API_BASE_URL } from "@/api/authApi";

if (typeof window !== "undefined" && !customElements.get("lord-icon")) {
  const script = document.createElement("script");
  script.src = "https://cdn.lordicon.com/lordicon.js";
  script.async = true;
  document.head.appendChild(script);
}

// Tự động thêm API_BASE_URL vào tất cả các request relative /api/ khi deploy production
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url = input;
  if (typeof input === "string") {
    if (input.startsWith("/api/")) {
      url = `${API_BASE_URL || ""}${input}`;
    }
  } else if (input instanceof Request) {
    const requestUrl = input.url;
    const origin = window.location.origin;
    if (requestUrl.startsWith(`${origin}/api/`)) {
      const relativePath = requestUrl.substring(origin.length);
      const newUrl = `${API_BASE_URL || ""}${relativePath}`;
      url = new Request(newUrl, input);
    }
  }
  return originalFetch(url, init);
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

