// Tạo URL từ tên trang bằng cách thay khoảng trắng bằng dấu gạch ngang
export function createPageUrl(pageName: string) {
  return "/" + pageName.replace(/ /g, "-");
}
