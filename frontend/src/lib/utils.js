import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Kết hợp class names với tailwind-merge để tránh xung đột
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Kiểm tra đang chạy trong iframe hay không
export const isIframe = window.self !== window.top;
