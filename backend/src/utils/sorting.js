/**
 * Module hỗ trợ sắp xếp kết quả truy vấn.
 * Cung cấp các helper function để parse query params sắp xếp
 * và mapping sang cột database tương ứng.
 */

const VALID_SORT_FIELDS = {
  created_at: "created_at",
  title: "title",
  complete_at: "complete_at",
};

const VALID_SORT_ORDERS = ["asc", "desc"];

/**
 * Lấy trường sắp xếp và thứ tự từ query params.
 * Nếu giá trị không hợp lệ, trả về giá trị mặc định.
 *
 * @param {Object} options
 * @param {string} options.sortField - Query param trường sắp xếp (VD: "created_at", "title")
 * @param {string} options.sortOrder - Query param thứ tự sắp xếp (VD: "asc", "desc")
 * @param {string} options.allowedFields - Mảng các trường được phép sắp xếp cho endpoint này
 * @param {string} options.defaultField - Trường sắp xếp mặc định (mặc định: "created_at")
 * @param {string} options.defaultOrder - Thứ tự sắp xếp mặc định (mặc định: "desc")
 * @returns {{ sortColumn: string, ascending: boolean }}
 *
 * @example
 * // Ví dụ 1: Sắp xếp theo ngày tạo giảm dần (mặc định)
 * parseSortParams({ sortField: "created_at", sortOrder: "desc", allowedFields: ["created_at", "title"], defaultField: "created_at", defaultOrder: "desc" })
 * // => { sortColumn: "created_at", ascending: false }
 *
 * @example
 * // Ví dụ 2: Sắp xếp theo tiêu đề tăng dần
 * parseSortParams({ sortField: "title", sortOrder: "asc", allowedFields: ["created_at", "title"], defaultField: "created_at", defaultOrder: "desc" })
 * // => { sortColumn: "title", ascending: true }
 *
 * @example
 * // Ví dụ 3: Giá trị không hợp lệ -> dùng mặc định
 * parseSortParams({ sortField: "invalid", sortOrder: "bad", allowedFields: ["created_at", "title"], defaultField: "created_at", defaultOrder: "desc" })
 * // => { sortColumn: "created_at", ascending: false }
 */
const parseSortParams = ({
  sortField,
  sortOrder,
  allowedFields,
  defaultField = "created_at",
  defaultOrder = "desc",
}) => {
  const allowed = allowedFields || Object.keys(VALID_SORT_FIELDS);

  let sortColumn = defaultField;
  if (sortField && allowed.includes(sortField)) {
    sortColumn = sortField;
  }

  let ascending = defaultOrder === "asc";
  if (sortOrder && VALID_SORT_ORDERS.includes(sortOrder.toLowerCase())) {
    ascending = sortOrder.toLowerCase() === "asc";
  }

  return { sortColumn, ascending };
};

/**
 * Tạo object order config cho Supabase.
 * @param {string} column - Tên cột trong database
 * @param {boolean} ascending - true = tăng dần, false = giảm dần
 * @returns {{ column: string, ascending: boolean }}
 */
const buildSupabaseOrder = (column, ascending) => ({
  column,
  ascending,
});

module.exports = {
  VALID_SORT_FIELDS,
  VALID_SORT_ORDERS,
  parseSortParams,
  buildSupabaseOrder,
};
