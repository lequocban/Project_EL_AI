// Navigation Guard - Quản lý trạng thái ngăn chặn navigation
import { useEffect, useRef } from "react";

let isPreventing = false;
let onConfirmCallback = null;
let isNavigating = false;

// Set trạng thái ngăn chặn navigation
export function setNavigationPrevention(preventing, confirmCallback = null) {
  isPreventing = preventing;
  onConfirmCallback = confirmCallback;
}

// Kiểm tra xem có đang ngăn navigation không
export function isNavigationPrevented() {
  return isPreventing;
}

// Gọi callback khi user xác nhận thoát
export function triggerNavigationConfirm() {
  if (onConfirmCallback) {
    isNavigating = true;
    onConfirmCallback();
  }
}

// Reset trạng thái navigating
export function resetNavigating() {
  isNavigating = false;
}

// Hook React để sử dụng trong component
export function useNavigationGuard(isActive, onConfirm) {
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  useEffect(() => {
    if (!isActive) {
      setNavigationPrevention(false, null);
      return;
    }

    // Push state vào history để chặn back button
    window.history.pushState({ guard: true }, "");

    setNavigationPrevention(true, () => {
      onConfirmRef.current();
    });

    const handlePopState = () => {
      if (isNavigating) {
        isNavigating = false;
        return;
      }

      if (isPreventing) {
        // Push state trở lại để giữ nguyên URL
        window.history.pushState({ guard: true }, "");
        // Trigger modal xác nhận thoát từ Layout
        window.dispatchEvent(new CustomEvent("navigation-guard-trigger"));
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      setNavigationPrevention(false, null);
    };
  }, [isActive]);
}

// Hook cho Layout để lắng nghe sự kiện navigation guard
export function useNavigationGuardListener(onTrigger) {
  useEffect(() => {
    const handleEvent = () => {
      if (onTrigger) {
        onTrigger();
      }
    };
    window.addEventListener("navigation-guard-trigger", handleEvent);
    return () => {
      window.removeEventListener("navigation-guard-trigger", handleEvent);
    };
  }, [onTrigger]);
}
