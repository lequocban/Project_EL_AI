/**
 * Chuyển đổi ngày sinh từ định dạng API (DD/MM/YYYY)
 * sang định dạng PostgreSQL (YYYY-MM-DD) để lưu vào database.
 *
 * @param {string} ddmmyyyy - Ví dụ: "15/01/2000"
 * @returns {string|null} - Ví dụ: "2000-01-15"
 */
const toDbDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return null;
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Chuyển đổi ngày sinh từ định dạng PostgreSQL (YYYY-MM-DD)
 * sang định dạng API trả về cho client (DD/MM/YYYY).
 *
 * @param {string|Date} value - Ví dụ: "2000-01-15" hoặc Date object
 * @returns {string|null} - Ví dụ: "15/01/2000"
 */
const toApiDate = (value) => {
  if (!value) return null;
  const str = typeof value === "string" ? value : value.toISOString();
  const datePart = str.split("T")[0]; // bỏ phần giờ nếu có
  const [yyyy, mm, dd] = datePart.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

module.exports = { toDbDate, toApiDate };
