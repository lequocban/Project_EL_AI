/**
 * Cloudinary upload service - Upload file audio lên Cloudinary
 * Dùng unsigned upload (Upload Preset) - không cần backend sign
 */

// Lấy biến môi trường an toàn
const getEnv = (key) => {
  try {
    return import.meta.env[key] || "";
  } catch {
    return "";
  }
};

const CLOUD_NAME = getEnv("VITE_CLOUDINARY_CLOUD_NAME");
const UPLOAD_PRESET = getEnv("VITE_CLOUDINARY_UPLOAD_PRESET");

// Upload file audio lên Cloudinary bằng unsigned upload và theo dõi tiến trình
export const uploadAudioToCloudinary = async (file, title, onProgress) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary chưa được cấu hình. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào .env.local"
    );
  }

  if (!file.type.includes("audio")) {
    throw new Error("Vui lòng chọn file audio (mp3, wav, v.v.)");
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error("File audio quá lớn. Vui lòng chọn file nhỏ hơn 50MB");
  }

  const sanitizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);

  const timestamp = Date.now();
  const publicId = `listening/${sanitizedTitle}-${timestamp}`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("public_id", publicId);
  formData.append("resource_type", "video"); // Cloudinary dùng "video" cho cả audio
  formData.append("folder", "listening");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch {
          reject(new Error("Không thể đọc phản hồi từ Cloudinary"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || "Upload thất bại"));
        } catch {
          reject(new Error(`Upload thất bại (HTTP ${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Lỗi mạng khi upload lên Cloudinary"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload bị hủy"));
    });

    xhr.open("POST", url);
    xhr.send(formData);
  });
};
