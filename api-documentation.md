# Tài Liệu API - Hệ Thống Nền Tảng Học Tiếng Anh

> **Phiên bản:** v1
> **Base URL:** `http://<domain>/api/v1`
> **> **Ngày cập nhật:** 15/05/2026

---

## Mục Lục

1. [Tổng Quan](#1-tổng-quan)
2. [Xác Thực & Ủy Quyền](#2-xác-thực--ủy-quyền)
3. [Query Parameters - Tham Số Truy Vấn](#3-query-parameters---tham-số-truy-vấn)
4. [Các Module API](#4-các-module-api)
   - 4.1. [Auth - Xác thực người dùng](#41-auth---xác-thực-người-dùng)
   - 4.2. [Profile - Hồ sơ cá nhân](#42-profile---hồ-sơ-cá-nhân)
   - 4.3. [Vocabulary - Tra cứu từ vựng](#43-vocabulary---tra-cứu-từ-vựng)
   - 4.4. [Vocabulary Sets - Bộ từ vựng](#44-vocabulary-sets---bộ-từ-vựng)
   - 4.5. [Practice - Luyện tập từ vựng](#45-practice---luyện-tập-từ-vựng)
   - 4.6. [Favorites - Bộ từ vựng yêu thích](#46-favorites---bộ-từ-vựng-yêu-thích)
   - 4.7. [Reading Lessons - Bài luyện đọc](#47-reading-lessons---bài-luyện-đọc)
   - 4.8. [Reading Questions - Câu hỏi đọc hiểu](#48-reading-questions---câu-hỏi-đọc-hiểu)
   - 4.9. [Reading Practice - Luyện đọc](#49-reading-practice---luyện-đọc)
   - 4.10. [Listening Lessons - Bài luyện nghe](#410-listening-lessons---bài-luyện-nghe)
   - 4.11. [Listening Questions - Câu hỏi nghe hiểu](#411-listening-questions---câu-hỏi-nghe-hiểu)
   - 4.12. [Listening Practice - Luyện nghe](#412-listening-practice---luyện-nghe)
   - 4.13. [Moderation Requests - Yêu cầu kiểm duyệt](#413-moderation-requests---yêu-cầu-kiểm-duyệt)
   - 4.14. [Learning Stats - Thống kê học tập](#414-learning-stats---thống-kê-học-tập)
   - 4.15. [Leaderboard - Bảng xếp hạng](#415-leaderboard---bảng-xếp-hạng)
   - 4.16. [Explain By AI - Giải thích đáp án bằng AI](#416-explain-by-ai---giải-thích-đáp-án-bằng-ai)
5. [Admin API](#5-admin-api)
   - 5.1. [Admin Auth - Đăng nhập quản trị](#51-admin-auth---đăng-nhập-quản-trị)
   - 5.2. [Admin Users - Quản lý người dùng](#52-admin-users---quản-lý-người-dùng)
   - 5.3. [Admin Stats - Thống kê hệ thống](#53-admin-stats---thống-kê-hệ-thống)
   - 5.4. [Admin Vocabulary Sets - Duyệt bộ từ vựng](#54-admin-vocabulary-sets---duyệt-bộ-từ-vựng)
   - 5.5. [Admin Reading Lessons - Duyệt bài đọc](#55-admin-reading-lessons---duyệt-bài-đọc)
   - 5.6. [Admin Listening Lessons - Duyệt bài nghe](#56-admin-listening-lessons---duyệt-bài-nghe)
   - 5.7. [Admin Moderation - Kiểm duyệt nội dung](#57-admin-moderation---kiểm-duyệt-nội-dung)
6. [Mã Trạng Thái](#6-mã-trạng-thái)
7. [Cấu Trúc Phản Hồi](#7-cấu-trúc-phản-hồi)

---

## 1. Tổng Quan

Hệ thống API được xây dựng theo kiến trúc **RESTful**, sử dụng **Node.js + Express.js** làm backend, **Supabase (PostgreSQL)** làm cơ sở dữ liệu, và **JWT (Supabase Auth)** để xác thực người dùng.

### Cấu trúc response chuẩn

**Thành công:**
```json
{
  "code": 200,
  "success": true,
  "message": "Mô tả kết quả",
  "data": { ... }
}
```

**Lỗi:**
```json
{
  "code": 400,
  "success": false,
  "message": "Mô tả lỗi"
}
```

---

## 2. Xác Thực & Ủy Quyền

### 2.1. Các cấp độ quyền

| Cấp độ | Role ID | Mô tả |
|---------|---------|--------|
| User | 1 | Người dùng thông thường |
| Content Manager | 2 | Người quản lý nội dung |
| Admin | 3 | Quản trị viên |

### 2.2. Cách truyền Token

Mỗi request cần xác thực đều phải gửi **JWT Access Token** qua header:

```
Authorization: Bearer <access_token>
```

### 2.3. Các middleware xác thực

| Middleware | Mô tả |
|------------|--------|
| `verifyToken` | Kiểm tra JWT token (nếu không có token vẫn cho qua, gán `req.user = null`) |
| `requireAuth` | Bắt buộc phải đăng nhập (token hợp lệ) |
| `requireAdmin` | Chỉ cho phép role_id = 3 (admin) |
| `requireManagerOrAdmin` | Cho phép role_id = 2 hoặc 3 (content_manager hoặc admin) |

### 2.4. Refresh Token

Refresh Token được lưu trong **HttpOnly Cookie** tự động. Khi access token hết hạn, client gọi endpoint `/refresh-token` để lấy access token mới.

---

## 3. Query Parameters - Tham Số Truy Vấn

> Phần này tổng hợp tất cả các tham số query được hỗ trợ trên toàn bộ hệ thống. Sử dụng làm tài liệu tham khảo nhanh.

### 3.1. Tổng Hợp Tất Cả Query Parameters

| Tham số | Kiểu | Mô tả | Áp dụng cho |
|----------|------|--------|-------------|
| `page` | number | Số trang (bắt đầu từ 1) | Tất cả endpoint có phân trang |
| `limit` | number | Số item trên mỗi trang | Tất cả endpoint có phân trang |
| `keyword` | string | Từ khóa tìm kiếm (tìm không phân biệt hoa thường, tìm trong tiêu đề) | Vocabulary Sets, Reading Lessons, Listening Lessons, Favorites, Moderation |
| `sortField` | string | Trường dùng để sắp xếp | Vocabulary Sets, Reading Lessons, Listening Lessons, Practice History, Favorites, Users, Moderation |
| `sortOrder` | string | Thứ tự sắp xếp: `asc` (tăng dần) hoặc `desc` (giảm dần) | Vocabulary Sets, Reading Lessons, Listening Lessons, Practice History, Favorites, Users, Moderation |
| `status` | string | Lọc theo trạng thái cụ thể | Moderation Requests, Admin Users |
| `role` | string | Lọc theo vai trò người dùng | Admin Users |
| `search` | string | Tìm kiếm theo email | Admin Users |

### 3.2. Chi Tiết Từng Query Parameter

#### `page` - Số Trang

| Thuộc tính | Giá trị |
|------------|--------|
| **Kiểu dữ liệu** | number (chuỗi số trong URL, ví dụ `?page=2`) |
| **Giá trị mặc định** | `1` (nếu không truyền hoặc giá trị không hợp lệ) |
| **Giá trị tối thiểu** | `1` (nếu truyền giá trị nhỏ hơn 1 sẽ tự động set về 1) |
| **Ví dụ** | `?page=3` → Trang thứ 3 |

#### `limit` - Số Item Trên Trang

| Thuộc tính | Giá trị |
|------------|--------|
| **Kiểu dữ liệu** | number (chuỗi số trong URL, ví dụ `?limit=20`) |
| **Giá trị mặc định** | Khác nhau tùy endpoint: `15` (danh sách), `10` (lich sử practice), `20` (admin users) |
| **Giới hạn tối đa** | Khác nhau tùy endpoint: `15` (client), `20` (lịch sử practice), `100` (client vocabulary-sets/:id, admin users) |
| **Ví dụ** | `?limit=10` → 10 item mỗi trang |
| **Lưu ý** | Nếu truyền giá trị vượt quá max, hệ thống sẽ tự động giới hạn ở max |

#### `keyword` - Tìm Kiếm Theo Tiêu Đề

| Thuộc tính | Giá trị |
|------------|--------|
| **Kiểu dữ liệu** | string |
| **Phương thức tìm kiếm** | Case-insensitive (không phân biệt hoa thường), partial match (chứa ký tự) |
| **Trường tìm kiếm** | Tiêu đề (`title`) |
| **Ví dụ** | `?keyword=IELTS` → Tìm tất cả item có tiêu đề chứa "IELTS" |
| **Mã hóa URL** | Nếu tiêu đề có dấu cách hoặc ký tự đặc biệt, cần URL encode. Ví dụ: `?keyword=Ngữ%20Văn` |

#### `sortField` - Trường Sắp Xếp

| Thuộc tính | Giá trị hợp lệ | Mô tả |
|------------|----------------|--------|
| **Vocabulary Sets / Reading Lessons / Listening Lessons / Favorites** | `created_at` (mặc định) | Sắp xếp theo ngày tạo |
| | `title` | Sắp xếp theo tiêu đề (A-Z / Z-A) |
| **Practice History** | `created_at` (mặc định) | Sắp xếp theo ngày làm bài |
| | `complete_at` | Sắp xếp theo ngày hoàn thành |
| | `score` | Sắp xếp theo điểm số |
| **Vocabulary Sets (sắp xếp từ bên trong)** | `word` (mặc định) | Sắp xếp từ vựng theo bảng chữ cái |
| | `created_at` | Sắp xếp từ vựng theo ngày thêm |
| **Admin Moderation** | `created_at` (mặc định) | Sắp xếp theo ngày gửi yêu cầu |
| **Admin Users** | `created_at` (mặc định) | Sắp xếp theo ngày tạo tài khoản |
| | `email` | Sắp xếp theo email |
| | `status` | Sắp xếp theo trạng thái tài khoản |

**Ví dụ:**
```
?sortField=title                    → Sắp xếp theo tiêu đề A → Z
?sortField=created_at&sortOrder=asc   → Cũ nhất lên đầu
?sortField=title&sortOrder=desc   → Tiêu đề Z → A
```

#### `sortOrder` - Thứ Tự Sắp Xếp

| Thuộc tính | Giá trị hợp lệ | Mô tả |
|------------|----------------|--------|
| `asc` | Tăng dần | A → Z, 1 → 100, cũ → mới |
| `desc` | Giảm dần (mặc định cho hầu hết endpoint) | Z → A, 100 → 1, mới → cũ |

**Quy tắc:**
- Giá trị không phân biệt hoa thường (`ASC`, `Asc`, `asc` đều hợp lệ)
- Giá trị không hợp lệ sẽ mặc định là `desc`
- Nếu không truyền `sortOrder`, hệ thống sử dụng `desc` (mới nhất trước)

#### `status` - Lọc Theo Trạng Thái

| Thuộc tính | Giá trị hợp lệ | Mô tả | Áp dụng cho |
|------------|----------------|--------|-------------|
| `pending` | Đang chờ xử lý | Yêu cầu chưa được duyệt/từ chối | Moderation Requests |
| `approved` | Đã được duyệt | Yêu cầu đã được phê duyệt | Moderation Requests |
| `rejected` | Đã bị từ chối | Yêu cầu đã bị từ chối | Moderation Requests |
| `active` | Tài khoản đang hoạt động | Người dùng đang sử dụng hệ thống bình thường | Admin Users |
| `inactive` | Tài khoản bị vô hiệu hóa | Người dùng bị khóa hoặc không hoạt động | Admin Users |

**Ví dụ:**
```
?status=pending       → Chỉ hiển thị yêu cầu đang chờ
?status=active       → Chỉ hiển thị tài khoản đang hoạt động
```

#### `role` - Lọc Theo Vai Trò (Admin Users)

| Thuộc tính | Giá trị hợp lệ | Mô tả |
|------------|----------------|--------|
| `user` | Người dùng thông thường | Người dùng thông thường (role_id = 1) |
| `content_manager` | Quản lý nội dung | Người quản lý nội dung (role_id = 2) |
| `admin` | Quản trị viên | Quản trị viên hệ thống (role_id = 3) |

**Ví dụ:**
```
?role=admin                → Chỉ hiển thị quản trị viên
?role=content_manager     → Chỉ hiển thị người quản lý nội dung
```

#### `search` - Tìm Kiếm Theo Email (Admin Users)

| Thuộc tính | Giá trị |
|------------|--------|
| **Kiểu dữ liệu** | string |
| **Phương thức tìm kiếm** | Case-insensitive (không phân biệt hoa thường), partial match (chứa ký tự) |
| **Trường tìm kiếm** | Email |
| **Ví dụ** | `?search=@gmail.com` → Tìm tất cả tài khoản có email chứa "@gmail.com" |
| **Khác với `keyword`** | `search` chỉ dùng cho bảng `profiles` (email), `keyword` dùng cho bảng `title` |

### 3.3. Bảng Tổng Hợp Query Params Theo Endpoint

| Endpoint | page | limit | keyword | sortField | sortOrder | status | role | search |
|---------|------|-------|---------|-----------|-----------|--------|------|--------|
| `/vocabulary-sets/my` | ✅ | ✅ | ✅ | ✅ `created_at`, `title` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/vocabulary-sets/public` | ✅ | ✅ | ✅ | ✅ `created_at`, `title` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/vocabulary-sets/:id` | ✅ | ✅ (max 100) | ❌ | ✅ `word`, `created_at` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/vocabulary-sets/:id/set-status` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/favorites/vocabulary-sets` | ✅ | ✅ | ✅ | ✅ `created_at`, `title` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/reading-lessons/my` | ✅ | ✅ | ✅ | ✅ `created_at`, `title` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/reading-lessons/public` | ✅ | ✅ | ✅ | ✅ `created_at`, `title` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/reading-lessons/practice/history` | ✅ | ✅ (max 20) | ❌ | ✅ `created_at`, `complete_at`, `score` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/reading-lessons/:id/set-status` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/listening-lessons/my` | ✅ | ✅ | ✅ | ✅ `created_at`, `title` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/listening-lessons/public` | ✅ | ✅ | ✅ | ✅ `created_at`, `title` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/listening-lessons/practice/history` | ✅ | ✅ (max 20) | ❌ | ✅ `created_at`, `complete_at`, `score` | ✅ `asc`, `desc` | ❌ | ❌ | ❌ |
| `/listening-lessons/:id/set-status` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/vocabulary-sets/practice/history` | ✅ | ✅ (max 20) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/moderation-requests/my` | ✅ | ✅ | ✅ | ✅ `created_at` | ✅ `asc`, `desc` | ✅ | ❌ | ❌ |
| `/admin/users` | ✅ | ✅ (max 100) | ❌ | ✅ `created_at`, `email`, `status` | ✅ `asc`, `desc` | ✅ | ✅ | ✅ |
| `/admin/vocabulary-sets/pending` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/reading-lessons/pending` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/listening-lessons/pending` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/moderation/*` | ✅ | ✅ | ❌ | ✅ `created_at` | ✅ `asc`, `desc` | ✅ | ❌ | ❌ |
| `/leaderboard` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.4. Ví Dụ Kết Hợp Nhiều Query Parameters

```
# Lấy trang 2, 10 item/trang, tìm "IELTS", sắp xếp theo tiêu đề A-Z
GET /api/v1/vocabulary-sets/public?page=2&limit=10&keyword=IELTS&sortField=title&sortOrder=asc

# Lọc yêu cầu kiểm duyệt đang chờ, sắp xếp mới nhất trước
GET /api/v1/moderation-requests/my?status=pending&sortOrder=desc

# Tìm user admin có email chứa "admin"
GET /api/v1/admin/users?search=admin&role=admin

# Lấy lịch sử luyện đọc, sắp xếp theo điểm cao nhất
GET /api/v1/reading-lessons/practice/history?sortField=score&sortOrder=desc
```

---

## 4. Các Module API

---

### 4.1. Auth - Xác Thực Người Dùng

#### 4.1.1. Đăng ký tài khoản

```
POST /auth/register
```

**Xác thực:** Không cần

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "userName": "Nguyễn Văn A",
  "dayOfBirth": "01/01/2000"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `email` | string | **Có** | Email hợp lệ (sẽ được chuyển thành chữ thường) |
| `password` | string | **Có** | Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa và 1 chữ số |
| `userName` | string | Không | Tên hiển thị (2-50 ký tự) |
| `dayOfBirth` | string | Không | Định dạng `DD/MM/YYYY` |

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "userName": "Nguyễn Văn A" },
    "accessToken": "eyJ...",
    "expiresAt": 1234567890,
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

---

#### 4.1.2. Đăng nhập

```
POST /auth/login
```

**Xác thực:** Không cần

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `email` | string | **Có** | Email đã đăng ký |
| `password` | string | **Có** | Mật khẩu |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "userName": "..." },
    "accessToken": "eyJ...",
    "expiresAt": 1234567890,
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

---

#### 4.1.3. Đăng xuất

```
POST /auth/logout
```

**Xác thực:** `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

#### 4.1.4. Làm mới Access Token

```
POST /auth/refresh-token
```

**Xác thực:** Không cần (sử dụng Refresh Token từ Cookie)

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "eyJ...",
    "expiresAt": 1234567890,
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

---

#### 4.1.5. Yêu cầu gửi mã OTP

```
POST /auth/request-otp
```

**Xác thực:** Không cần

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Mã OTP đã được gửi đến email của bạn",
  "data": null
}
```

---

#### 4.1.6. Đặt lại mật khẩu bằng OTP

```
POST /auth/reset-password
```

**Xác thực:** Không cần

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `email` | string | **Có** | Email đã đăng ký |
| `otp` | string | **Có** | Mã OTP 6 chữ số |
| `newPassword` | string | **Có** | Mật khẩu mới (tối thiểu 8 ký tự, có chữ hoa và chữ số) |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Đặt lại mật khẩu thành công",
  "data": null
}
```

---

#### 4.1.7. Đổi mật khẩu (khi đã đăng nhập)

```
PATCH /auth/change-password
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `currentPassword` | string | **Có** | Mật khẩu hiện tại |
| `newPassword` | string | **Có** | Mật khẩu mới (tối thiểu 8 ký tự, có chữ hoa và chữ số) |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

**Các trường hợp lỗi:**

| Mã | Thông báo | Điều kiện |
|----|-----------|-----------|
| 400 | "Mật khẩu hiện tại không đúng" | currentPassword không khớp |
| 400 | "Mật khẩu mới không hợp lệ" | newPassword không đủ điều kiện |
| 400 | "Mật khẩu mới không được trùng với mật khẩu hiện tại" | newPassword giống currentPassword |
| 401 | "Unauthorized" | Token không hợp lệ |

---

### 4.2. Profile - Hồ Sơ Cá Nhân

#### 4.2.1. Lấy thông tin hồ sơ

```
GET /profile/me
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy thông tin hồ sơ thành công",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "userName": "Nguyễn Văn A",
    "dayOfBirth": "01/01/2000",
    "role": "user"
  }
}
```

---

#### 4.2.2. Cập nhật hồ sơ

```
PATCH /profile/me
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "userName": "Tên mới",
  "dayOfBirth": "15/05/2000"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `userName` | string | Không | Tên hiển thị mới (2-50 ký tự) |
| `dayOfBirth` | string | Không | Ngày sinh mới (định dạng `DD/MM/YYYY`) |

**Lưu ý:** Phải gửi ít nhất một trường. Email và password không được phép cập nhật qua endpoint này.

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "userName": "Tên mới",
    "dayOfBirth": "15/05/2000",
    "role": "user"
  }
}
```

---

### 4.3. Vocabulary - Tra Cứu Từ Vựng

#### 4.3.1. Tra cứu từ vựng

```
POST /vocabulary/lookup
```

**Xác thực:** `requireAuth`

**Request Body:**
```json
{
  "word": "beautiful"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `word` | string | **Có** | Từ cần tra (tối đa 100 ký tự, sẽ được chuyển thành chữ thường) |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Tra cứu từ vựng thành công",
  "data": {
    "word": "beautiful",
    "phonetic": "/ˈbjuːtɪf(ə)l/",
    "partOfSpeech": "adjective",
    "definitions": [
      {
        "meaning": "Rất đẹp, xinh xắn",
        "example": "She is a beautiful girl."
      }
    ],
    "synonyms": ["lovely", "pretty", "gorgeous"],
    "source": "local"
  }
}
```

**Trường `source`:** `"local"` nếu từ có trong database, `"external"` nếu tra từ API bên ngoài và lưu vào database.

---

### 4.4. Vocabulary Sets - Bộ Từ Vựng

#### 4.4.1. Tạo bộ từ vựng mới

```
POST /vocabulary-sets
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "IELTS Vocabulary - Topic: Environment",
  "description": "Từ vựng IELTS chủ đề Môi trường"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `title` | string | **Có** | Tiêu đề bộ từ vựng (1-255 ký tự) |
| `description` | string | Không | Mô tả (tối đa 1000 ký tự) |

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Tạo bộ từ vựng thành công",
  "data": {
    "id": "uuid",
    "title": "IELTS Vocabulary - Topic: Environment",
    "description": "Từ vựng IELTS chủ đề Môi trường",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z"
  }
}
```

**Trường `status`:** `"private"` - bộ từ vựng riêng tư, `"req_public"` - đang chờ duyệt công khai, `"public"` - công khai.

---

#### 4.4.2. Lấy danh sách bộ từ vựng của tôi

```
GET /vocabulary-sets/my
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `15` | `15` | Số item trên trang |
| `keyword` | string | `""` | - | Tìm kiếm theo tiêu đề (không phân biệt hoa thường, tìm chứa) |
| `sortField` | string | `"created_at"` | - | Trường sắp xếp: `created_at` (ngày tạo), `title` (tiêu đề) |
| `sortOrder` | string | `"desc"` | - | Thứ tự: `asc` (tăng dần), `desc` (giảm dần) |

**Ví dụ:**
```
GET /api/v1/vocabulary-sets/my?page=1&limit=10&keyword=IELTS&sortField=title&sortOrder=asc
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy danh sách bộ từ vựng thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "IELTS Vocabulary - Environment",
        "description": "...",
        "wordCount": 25
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

#### 4.4.3. Lấy danh sách bộ từ vựng công khai

```
GET /vocabulary-sets/public
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:** Tương tự `/vocabulary-sets/my`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy danh sách bộ từ vựng công khai thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "IELTS Vocabulary - Environment",
        "description": "...",
        "wordCount": 25
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 15,
    "totalPages": 4
  }
}
```

---

#### 4.4.4. Lấy chi tiết bộ từ vựng

```
GET /vocabulary-sets/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|-----------|--------|
| `page` | number | `1` | Số trang từ vựng |
| `limit` | number | `15` | Số từ vựng mỗi trang (tối đa `100`) |
| `sortField` | string | `"word"` | Trường sắp xếp từ vựng: `word` (bảng chữ cái), `created_at` (ngày thêm) |
| `sortOrder` | string | `"asc"` | Thứ tự: `asc` (A-Z / cũ-mới), `desc` (Z-A / mới-cũ) |

**Ví dụ:**
```
GET /api/v1/vocabulary-sets/uuid?page=1&limit=20&sortField=word&sortOrder=asc   → Từ A → Z, 20 từ/trang
GET /api/v1/vocabulary-sets/uuid?page=2&limit=20&sortField=created_at&sortOrder=desc → Trang 2, mới nhất trước
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy chi tiết bộ từ vựng thành công",
  "data": {
    "id": "uuid",
    "title": "IELTS Vocabulary - Environment",
    "description": "...",
    "status": "public",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z",
    "updatedAt": "2026-05-10T00:00:00Z",
    "words": {
      "items": [
        {
          "id": "uuid",
          "word": "environment",
          "phonetic": "/ɪnˈvaɪrənmənt/",
          "meaning": "Môi trường",
          "audioUrl": "https://example.com/environment.mp3",
          "createdAt": "2026-05-10T00:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 15,
        "total": 250,
        "totalPages": 17
      }
    }
  }
}
```

---

#### 4.4.5. Cập nhật bộ từ vựng

```
PATCH /vocabulary-sets/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "IELTS Vocabulary - Updated",
  "description": "Mô tả mới"
}
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Cập nhật bộ từ vựng thành công",
  "data": {
    "id": "uuid",
    "title": "IELTS Vocabulary - Updated",
    "description": "Mô tả mới",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z",
    "updatedAt": "2026-05-15T00:00:00Z"
  }
}
```

---

#### 4.4.6. Xóa bộ từ vựng

```
DELETE /vocabulary-sets/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Lưu ý:** Xóa mềm - dữ liệu vẫn còn trong database nhưng không hiển thị.

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Xóa bộ từ vựng thành công",
  "data": null
}
```

---

#### 4.4.7. Tạo bộ từ vựng bằng AI

```
POST /vocabulary-sets/generate-words
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "Business English - Meeting",
  "description": "Từ vựng Tiếng Anh thương mại",
  "topic": "Business meetings, presentations, negotiations in corporate settings",
  "wordCount": 15
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `title` | string | **Có** | Tiêu đề bộ từ vựng (1-255 ký tự) |
| `description` | string | Không | Mô tả (tối đa 1000 ký tự) |
| `topic` | string | **Có** | Chủ đề từ vựng (1-500 ký tự) - AI sẽ sinh từ dựa trên chủ đề này |
| `wordCount` | number | Không | Số từ cần sinh (mặc định: 10, tối thiểu: 1, tối đa: 30) |

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Tạo bộ từ vựng bằng AI thành công",
  "data": {
    "id": "uuid",
    "title": "Business English - Meeting",
    "description": "Từ vựng Tiếng Anh thương mại",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-15T00:00:00Z",
    "words": {
      "items": [
        {
          "id": "uuid",
          "word": "agenda",
          "phonetic": "/əˈdʒendə/",
          "meaning": "Chương trình nghị sự",
          "audioUrl": "https://example.com/agenda.mp3",
          "createdAt": "2026-05-15T00:00:00Z"
        }
      ],
      "total": 15
    }
  }
}
```

---

#### 4.4.8. Thêm từ vào bộ từ vựng

```
POST /vocabulary-sets/:id/words
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "words": ["sustainable", "biodiversity", "renewable"]
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `words` | array[string] | **Có** | Danh sách từ cần thêm (tối đa 100 từ mỗi lần) |

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Thêm từ vào bộ từ vựng thành công",
  "data": {
    "addedCount": 3,
    "words": [
      {
        "id": "uuid",
        "word": "sustainable",
        "phonetic": "/səˈsteɪnəbl/",
        "meaning": "Bền vững",
        "audioUrl": "https://example.com/sustainable.mp3",
        "createdAt": "2026-05-15T00:00:00Z"
      }
    ]
  }
}
```

---

#### 4.4.9. Yêu cầu công khai bộ từ vựng

```
POST /vocabulary-sets/:id/request-public
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Gửi yêu cầu công khai bộ từ vựng thành công",
  "data": {
    "id": "uuid",
    "title": "IELTS Vocabulary - Environment",
    "description": "...",
    "status": "req_public",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z"
  }
}
```

---

#### 4.4.10. Chuyển bộ từ vựng sang chế độ riêng tư

```
POST /vocabulary-sets/:id/make-private
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Chuyển bộ từ vựng sang chế độ riêng tư thành công",
  "data": {
    "id": "uuid",
    "title": "IELTS Vocabulary - Environment",
    "description": "...",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z"
  }
}
```

---

#### 4.4.11. Xóa từ khỏi bộ từ vựng

```
DELETE /vocabulary-sets/:id/words/remove
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "wordIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Xóa từ khỏi bộ từ vựng thành công",
  "data": {
    "deletedCount": 3
  }
}
```

---

#### 4.4.12. Thay đổi trạng thái bộ từ vựng (Manager/Admin)

```
PATCH /vocabulary-sets/:id/set-status
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Mô tả:** Cho phép người dùng có vai trò `content_manager` (role_id = 2) hoặc `admin` (role_id = 3) thay đổi trạng thái bộ từ vựng **của chính họ** mà không cần qua kiểm duyệt. Chỉ hỗ trợ chuyển giữa `private` và `public`, không áp dụng cho trạng thái `req_public`.

**Request Body:**
```json
{
  "status": "public"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `status` | string | **Có** | Trạng thái mới: `private` hoặc `public` |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Thay đổi trạng thái bộ từ vựng thành công",
  "data": {
    "id": "uuid",
    "title": "IELTS Vocabulary - Environment",
    "description": "...",
    "status": "public",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z",
    "updatedAt": "2026-05-14T00:00:00Z"
  }
}
```

**Lưu ý:**
- Chỉ chủ sở hữu bộ từ vựng mới được thay đổi trạng thái.
- Chỉ nhận giá trị `private` hoặc `public`, không chấp nhận `req_public`.
- Không thể chuyển sang trạng thái đã có sẵn (VD: đang `public` mà gửi `public` sẽ báo lỗi).

**Các trường hợp lỗi:**

| Mã | Thông báo | Điều kiện |
|----|-----------|-----------|
| 400 | "Trạng thái không hợp lệ. Chỉ chấp nhận: private, public" | Truyền giá trị khác `private`/`public` |
| 400 | "Bộ từ vựng đã ở trạng thái này" | Truyền trạng thái giống trạng thái hiện tại |
| 403 | "Bạn không có quyền thay đổi bộ từ vựng này" | Không phải chủ sở hữu |
| 403 | "Bạn không có quyền thực hiện thao tác này" | Không có vai trò content_manager hoặc admin |
| 404 | "Không tìm thấy bộ từ vựng" | ID không tồn tại |

---

### 4.5. Practice - Luyện Tập Từ Vựng

#### 4.5.1. Nộp bài luyện tập từ vựng

```
POST /vocabulary-sets/practice/submit
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "setId": "uuid-của-bộ-từ-vựng",
  "type": "quiz",
  "timeSpent": 300,
  "answers": [
    { "wordId": "uuid-1", "answer": "A" },
    { "wordId": "uuid-2", "answer": "environment" }
  ]
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `setId` | uuid | **Có** | ID của bộ từ vựng |
| `type` | string | **Có** | Loại bài tập: `quiz`, `listening_quiz`, `translate_write`, `listen_write` |
| `timeSpent` | number | Không | Thời gian làm bài (giây) |
| `answers` | array | **Có** | Danh sách đáp án (tối thiểu 1 đáp án) |

**Cấu trúc `answers` theo loại bài:**

- **quiz / listening_quiz:**
```json
{ "wordId": "uuid", "answer": "A" }
```

- **translate_write / listen_write:**
```json
{ "wordId": "uuid", "answer": "môi trường" }
```

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Nộp bài luyện tập thành công",
  "data": {
    "score": 80,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "wrongAnswers": 2,
    "timeSpent": 300,
    "wrongWords": [
      { "word": "sustainable", "correctAnswer": "bền vững", "yourAnswer": "bền vững1", "isCorrect": false }
    ]
  }
}
```

---

#### 4.5.2. Lấy lịch sử luyện tập

```
GET /vocabulary-sets/practice/history
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `10` | `20` | Số item trên trang |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy lịch sử luyện tập thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "setId": "uuid",
        "setTitle": "IELTS Vocabulary - Environment",
        "type": "quiz",
        "score": 80,
        "totalQuestions": 10,
        "correctAnswers": 8,
        "timeSpent": 300,
        "createdAt": "2026-05-10T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 4.6. Favorites - Bộ Từ Vựng Yêu Thích

#### 4.6.1. Thêm bộ từ vựng vào yêu thích

```
POST /favorites/vocabulary-sets/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Thêm bộ từ vựng vào yêu thích thành công",
  "data": null
}
```

**Các trường hợp lỗi:**

| Mã | Thông báo | Điều kiện |
|----|-----------|-----------|
| 409 | "Bộ từ vựng này đã có trong danh sách yêu thích" | Đã thêm rồi |
| 404 | "Không tìm thấy bộ từ vựng" | ID không tồn tại |

---

#### 4.6.2. Xóa bộ từ vựng khỏi yêu thích

```
DELETE /favorites/vocabulary-sets/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Xóa bộ từ vựng khỏi yêu thích thành công",
  "data": null
}
```

---

#### 4.6.3. Lấy danh sách bộ từ vựng yêu thích

```
GET /favorites/vocabulary-sets
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `15` | `15` | Số item trên trang |
| `keyword` | string | `""` | - | Tìm kiếm theo tiêu đề bộ từ vựng (không phân biệt hoa thường, tìm chứa) |
| `sortField` | string | `"created_at"` | - | Trường sắp xếp: `created_at` (ngày thêm vào yêu thích), `title` (tiêu đề bộ từ) |
| `sortOrder` | string | `"desc"` | - | Thứ tự: `asc` (tăng dần), `desc` (giảm dần) |

**Ví dụ:**
```
GET /api/v1/favorites/vocabulary-sets?page=1&limit=5&keyword=IELTS&sortField=title&sortOrder=asc
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy danh sách bộ từ vựng yêu thích thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "IELTS Vocabulary - Environment",
        "description": "...",
        "wordCount": 25,
        "favoritedAt": "2026-05-10T00:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 15,
    "totalPages": 1
  }
}
```

---

### 4.7. Reading Lessons - Bài Luyện Đọc

#### 4.7.1. Tạo bài luyện đọc bằng AI

```
POST /reading-lessons/generate-with-ai
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "The Impact of Climate Change",
  "topic": "Write a reading passage about climate change...",
  "questionCount": 5
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `title` | string | **Có** | Tiêu đề bài luyện đọc (1-255 ký tự) |
| `topic` | string | **Có** | Chủ đề nội dung (1-500 ký tự) |
| `questionCount` | number | Không | Số câu hỏi (mặc định: 5, tối đa: 5) |

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Tạo bài luyện đọc bằng AI thành công",
  "data": {
    "id": "uuid",
    "title": "The Impact of Climate Change",
    "content": "...",
    "viTranslation": "...",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-15T00:00:00Z",
    "questions": [
      {
        "id": "uuid",
        "question": "What is the main topic of the passage?",
        "option_a": "...",
        "option_b": "...",
        "option_c": "...",
        "option_d": "...",
        "correct_answer": "B"
      }
    ]
  }
}
```

---

#### 4.7.2. Tạo bài luyện đọc (thủ công)

```
POST /reading-lessons
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "The Benefits of Reading",
  "content": "Article content here...",
  "vi_translation": "Bản dịch tiếng Việt..."
}
```

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Tạo bài luyện đọc thành công",
  "data": {
    "id": "uuid",
    "title": "The Benefits of Reading",
    "content": "Article content here...",
    "viTranslation": "Bản dịch tiếng Việt...",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-15T00:00:00Z"
  }
}
```

---

#### 4.7.3. Lấy danh sách bài luyện đọc của tôi

```
GET /reading-lessons/my
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `15` | `15` | Số item trên trang |
| `keyword` | string | `""` | - | Tìm kiếm theo tiêu đề (không phân biệt hoa thường, tìm chứa) |
| `sortField` | string | `"created_at"` | - | Trường sắp xếp: `created_at` (ngày tạo), `title` (tiêu đề) |
| `sortOrder` | string | `"desc"` | - | Thứ tự: `asc` (tăng dần), `desc` (giảm dần) |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy danh sách bài luyện đọc của tôi thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "The Impact of Climate Change",
        "status": "private",
        "questionCount": 5,
        "createdAt": "2026-05-10T00:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 15,
    "totalPages": 2
  }
}
```

---

#### 4.7.4. Lấy danh sách bài luyện đọc công khai

```
GET /reading-lessons/public
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:** Tương tự `/reading-lessons/my`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy danh sách bài luyện đọc công khai thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "The Impact of Climate Change",
        "status": "public",
        "questionCount": 5,
        "createdAt": "2026-05-10T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 15,
    "totalPages": 4
  }
}
```

---

#### 4.7.5. Lấy chi tiết bài luyện đọc

```
GET /reading-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy chi tiết bài luyện đọc thành công",
  "data": {
    "id": "uuid",
    "title": "The Impact of Climate Change",
    "content": "The rapid advancement of technology has transformed...",
    "viTranslation": "Sự phát triển nhanh chóng của công nghệ đã thay đổi...",
    "status": "public",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z",
    "updatedAt": "2026-05-10T00:00:00Z",
    "questions": [
      {
        "id": "uuid",
        "question": "What is the main topic of the passage?",
        "option_a": "...",
        "option_b": "...",
        "option_c": "...",
        "option_d": "..."
      }
    ]
  }
}
```

---

#### 4.7.6. Cập nhật bài luyện đọc

```
PATCH /reading-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "vi_translation": "Bản dịch mới..."
}
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Cập nhật bài luyện đọc thành công",
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "content": "Updated content...",
    "viTranslation": "Bản dịch mới...",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z",
    "updatedAt": "2026-05-15T00:00:00Z"
  }
}
```

---

#### 4.7.7. Xóa bài luyện đọc

```
DELETE /reading-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Lưu ý:** Xóa mềm.

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Xóa bài luyện đọc thành công",
  "data": null
}
```

---

#### 4.7.8. Yêu cầu công khai bài luyện đọc

```
POST /reading-lessons/:id/request-public
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Gửi yêu cầu công khai bài luyện đọc thành công",
  "data": {
    "id": "uuid",
    "title": "The Impact of Climate Change",
    "status": "req_public",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z"
  }
}
```

---

#### 4.7.9. Chuyển bài luyện đọc về chế độ riêng tư

```
POST /reading-lessons/:id/make-private
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Chuyển bài luyện đọc sang chế độ riêng tư thành công",
  "data": {
    "id": "uuid",
    "title": "The Impact of Climate Change",
    "status": "private",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z"
  }
}
```

---

#### 4.7.10. Thay đổi trạng thái bài luyện đọc (Manager/Admin)

```
PATCH /reading-lessons/:id/set-status
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Mô tả:** Cho phép người dùng có vai trò `content_manager` (role_id = 2) hoặc `admin` (role_id = 3) thay đổi trạng thái bài luyện đọc **của chính họ** mà không cần qua kiểm duyệt. Chỉ hỗ trợ chuyển giữa `private` và `public`.

**Request Body:**
```json
{
  "status": "public"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `status` | string | **Có** | Trạng thái mới: `private` hoặc `public` |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Thay đổi trạng thái bài luyện đọc thành công",
  "data": {
    "id": "uuid",
    "title": "The Impact of Climate Change",
    "content": "...",
    "viTranslation": "...",
    "status": "public",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z"
  }
}
```

**Lưu ý:**
- Chỉ chủ sở hữu bài luyện đọc mới được thay đổi trạng thái.
- Chỉ nhận giá trị `private` hoặc `public`.
- Không thể chuyển sang trạng thái đã có sẵn.

**Các trường hợp lỗi:**

| Mã | Thông báo | Điều kiện |
|----|-----------|-----------|
| 400 | "Trạng thái không hợp lệ. Chỉ chấp nhận: private, public" | Truyền giá trị khác `private`/`public` |
| 400 | "Bài luyện đọc đã ở trạng thái này" | Truyền trạng thái giống trạng thái hiện tại |
| 403 | "Bạn không có quyền thay đổi bài luyện đọc này" | Không phải chủ sở hữu |
| 403 | "Bạn không có quyền thực hiện thao tác này" | Không có vai trò content_manager hoặc admin |
| 404 | "Không tìm thấy bài luyện đọc" | ID không tồn tại |

---

### 4.8. Reading Questions - Câu Hỏi Đọc Hiểu

#### 4.8.1. Tạo câu hỏi cho bài luyện đọc

```
POST /reading-lessons/:lessonId/questions
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "question": "What is the main idea of the passage?",
  "option_a": "Climate change is only caused by natural factors",
  "option_b": "Human activities are the primary driver of climate change",
  "option_c": "Climate change has no significant impact",
  "option_d": "Only governments can solve climate change",
  "correct_answer": "B",
  "explain": "The passage clearly states that human activities..."
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `question` | string | **Có** | Nội dung câu hỏi (1-2000 ký tự) |
| `correct_answer` | string | **Có** | Đáp án đúng: `A`, `B`, `C`, hoặc `D` |
| `option_a` - `option_d` | string | Không | Các lựa chọn (tối đa 1000 ký tự) |
| `explain` | string | Không | Giải thích đáp án (tối đa 2000 ký tự) |

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Tạo câu hỏi thành công",
  "data": {
    "id": "uuid",
    "lessonId": "uuid",
    "question": "What is the main idea of the passage?",
    "option_a": "Climate change is only caused by natural factors",
    "option_b": "Human activities are the primary driver of climate change",
    "option_c": "Climate change has no significant impact",
    "option_d": "Only governments can solve climate change",
    "correct_answer": "B",
    "explain": "The passage clearly states that human activities...",
    "createdAt": "2026-05-15T00:00:00Z"
  }
}
```

---

#### 4.8.2. Tạo nhiều câu hỏi cùng lúc

```
POST /reading-lessons/:lessonId/questions/bulk
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "questions": [
    {
      "question": "Câu hỏi 1?",
      "option_a": "A", "option_b": "B", "option_c": "C", "option_d": "D",
      "correct_answer": "B",
      "explain": "Giải thích 1"
    },
    {
      "question": "Câu hỏi 2?",
      "option_a": "X", "option_b": "Y", "option_c": "Z", "option_d": "W",
      "correct_answer": "A",
      "explain": "Giải thích 2"
    }
  ]
}
```

**Phản hồi (201):**
```json
{
  "code": 201,
  "success": true,
  "message": "Tạo nhiều câu hỏi thành công",
  "data": {
    "createdCount": 2,
    "questions": [
      {
        "id": "uuid-1",
        "lessonId": "uuid",
        "question": "Câu hỏi 1?",
        "correct_answer": "B",
        "createdAt": "2026-05-15T00:00:00Z"
      }
    ]
  }
}
```

---

#### 4.8.3. Lấy danh sách câu hỏi của bài luyện đọc

```
GET /reading-lessons/:lessonId/questions
```

**Xác thực:** `verifyToken` + `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy danh sách câu hỏi thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "lessonId": "uuid",
        "question": "What is the main idea of the passage?",
        "option_a": "...",
        "option_b": "...",
        "option_c": "...",
        "option_d": "...",
        "correct_answer": "B",
        "createdAt": "2026-05-15T00:00:00Z"
      }
    ],
    "total": 5
  }
}
```

---

#### 4.8.4. Cập nhật câu hỏi

```
PATCH /reading-questions/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

---

#### 4.8.5. Xóa một câu hỏi

```
DELETE /reading-questions/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

---

#### 4.8.6. Xóa nhiều câu hỏi

```
DELETE /reading-questions/bulk
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

### 4.9. Reading Practice - Luyện Đọc

#### 4.9.1. Nộp bài luyện đọc

```
POST /reading-lessons/:lessonId/practice/submit
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "lessonId": "uuid-của-bài-luyện-đọc",
  "answers": [
    { "questionId": "uuid-1", "answer": "B" },
    { "questionId": "uuid-2", "answer": "A" },
    { "questionId": "uuid-3", "answer": "C" }
  ]
}
```

---

#### 4.9.2. Lấy lịch sử luyện đọc

```
GET /reading-lessons/practice/history
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `10` | `20` | Số item trên trang |
| `sortField` | string | `"created_at"` | - | Trường sắp xếp: `created_at` (ngày làm), `complete_at` (ngày hoàn thành), `score` (điểm số) |
| `sortOrder` | string | `"desc"` | - | Thứ tự: `asc` (tăng dần), `desc` (giảm dần) |

**Ví dụ:**
```
GET /api/v1/reading-lessons/practice/history?sortField=score&sortOrder=desc
  → Hiển thị điểm cao nhất trước
GET /api/v1/reading-lessons/practice/history?sortField=complete_at&sortOrder=asc
  → Hiển thị bài cũ nhất trước
```

---

#### 4.9.3. Lấy chi tiết bài luyện đọc đã làm

```
GET /reading-lessons/practice/:practiceId
```

**Xác thực:** `verifyToken` + `requireAuth`

---

### 4.10. Listening Lessons - Bài Luyện Nghe

#### 4.10.1. Tạo bài luyện nghe bằng AI

```
POST /listening-lessons/generate-ai
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "Business Phone Call",
  "topic": "A phone conversation between a manager and an employee discussing project deadlines...",
  "questionCount": 5
}
```

---

#### 4.10.2. Tạo bài luyện nghe (thủ công)

```
POST /listening-lessons
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "title": "Daily English Conversation",
  "audioUrl": "https://example.com/audio.mp3",
  "transcript": "Full transcript of the audio...",
  "viTranslation": "Bản dịch tiếng Việt..."
}
```

---

#### 4.10.3. Lấy danh sách bài luyện nghe của tôi

```
GET /listening-lessons/my
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:** Tương tự `/reading-lessons/my`

---

#### 4.10.4. Lấy danh sách bài luyện nghe công khai

```
GET /listening-lessons/public
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:** Tương tự `/reading-lessons/my`

---

#### 4.10.5. Lấy chi tiết bài luyện nghe

```
GET /listening-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

---

#### 4.10.6. Cập nhật bài luyện nghe

```
PATCH /listening-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Lưu ý:** Không cho phép cập nhật `status` qua endpoint này.

---

#### 4.10.7. Xóa bài luyện nghe

```
DELETE /listening-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth`

**Lưu ý:** Xóa mềm.

---

#### 4.10.8. Yêu cầu công khai bài luyện nghe

```
POST /listening-lessons/:id/request-public
```

**Xác thực:** `verifyToken` + `requireAuth`

---

#### 4.10.9. Chuyển bài luyện nghe về chế độ riêng tư

```
POST /listening-lessons/:id/make-private
```

**Xác thực:** `verifyToken` + `requireAuth`

---

#### 4.10.10. Thay đổi trạng thái bài luyện nghe (Manager/Admin)

```
PATCH /listening-lessons/:id/set-status
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Mô tả:** Cho phép người dùng có vai trò `content_manager` (role_id = 2) hoặc `admin` (role_id = 3) thay đổi trạng thái bài luyện nghe **của chính họ** mà không cần qua kiểm duyệt. Chỉ hỗ trợ chuyển giữa `private` và `public`.

**Request Body:**
```json
{
  "status": "public"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `status` | string | **Có** | Trạng thái mới: `private` hoặc `public` |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Thay đổi trạng thái bài luyện nghe thành công",
  "data": {
    "id": "uuid",
    "title": "Business Phone Call",
    "audioUrl": "https://example.com/audio.mp3",
    "transcript": "...",
    "viTranslation": "...",
    "status": "public",
    "createdBy": "uuid",
    "createdAt": "2026-05-10T00:00:00Z"
  }
}
```

**Lưu ý:**
- Chỉ chủ sở hữu bài luyện nghe mới được thay đổi trạng thái.
- Chỉ nhận giá trị `private` hoặc `public`.
- Không thể chuyển sang trạng thái đã có sẵn.

**Các trường hợp lỗi:**

| Mã | Thông báo | Điều kiện |
|----|-----------|-----------|
| 400 | "Trạng thái không hợp lệ. Chỉ chấp nhận: private, public" | Truyền giá trị khác `private`/`public` |
| 400 | "Bài luyện nghe đã ở trạng thái này" | Truyền trạng thái giống trạng thái hiện tại |
| 403 | "Bạn không có quyền thay đổi bài luyện nghe này" | Không phải chủ sở hữu |
| 403 | "Bạn không có quyền thực hiện thao tác này" | Không có vai trò content_manager hoặc admin |
| 404 | "Không tìm thấy bài luyện nghe" | ID không tồn tại |

---

### 4.11. Listening Questions - Câu Hỏi Nghe Hiểu

Tương tự **Reading Questions** (mục 4.8), nhưng thay `reading-lessons` bằng `listening-lessons` và `reading-questions` bằng `listening-questions`.

#### Các endpoint tương ứng:

| HTTP | Endpoint | Mô tả |
|------|----------|--------|
| POST | `/listening-lessons/:lessonId/questions` | Tạo câu hỏi |
| POST | `/listening-lessons/:lessonId/questions/bulk` | Tạo nhiều câu hỏi |
| GET | `/listening-lessons/:lessonId/questions` | Lấy danh sách câu hỏi |
| PATCH | `/listening-questions/:id` | Cập nhật câu hỏi |
| DELETE | `/listening-questions/:id` | Xóa một câu hỏi |
| DELETE | `/listening-questions/bulk` | Xóa nhiều câu hỏi |

---

### 4.12. Listening Practice - Luyện Nghe

Tương tự **Reading Practice** (mục 4.9), nhưng thay `reading-lessons` bằng `listening-lessons`.

#### Các endpoint tương ứng:

| HTTP | Endpoint | Query Parameters |
|------|----------|-----------------|
| POST | `/listening-lessons/:lessonId/practice/submit` | - |
| GET | `/listening-lessons/practice/history` | `page`, `limit`, `sortField`, `sortOrder` |
| GET | `/listening-lessons/practice/:practiceId` | - |

---

### 4.13. Moderation Requests - Yêu Cầu Kiểm Duyệt

#### 4.13.1. Tạo yêu cầu kiểm duyệt nội dung

```
POST /moderation-requests
```

**Xác thực:** `verifyToken` + `requireAuth`

**Request Body:**
```json
{
  "contentType": "vocabulary_set",
  "contentId": "uuid-của-bộ-từ-vựng"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `contentType` | string | **Có** | Loại nội dung: `vocabulary_set`, `reading_lesson`, `listening_lesson` |
| `contentId` | uuid | **Có** | ID của nội dung cần kiểm duyệt |

---

#### 4.13.2. Lấy danh sách yêu cầu kiểm duyệt của tôi

```
GET /moderation-requests/my
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `15` | `15` | Số item trên trang |
| `keyword` | string | `""` | - | Tìm kiếm theo loại nội dung (`vocabulary_set`, `reading_lesson`, `listening_lesson`) |
| `sortField` | string | `"created_at"` | - | Trường sắp xếp: `created_at` (ngày gửi yêu cầu) |
| `sortOrder` | string | `"desc"` | - | Thứ tự: `asc` (cũ → mới), `desc` (mới → cũ) |
| `status` | string | `""` | - | Lọc theo trạng thái: `pending` (đang chờ), `approved` (đã duyệt), `rejected` (đã từ chối) |

**Ví dụ:**
```
GET /api/v1/moderation-requests/my?status=pending&sortOrder=desc
  → Hiển thị yêu cầu đang chờ, mới nhất trước

GET /api/v1/moderation-requests/my?keyword=vocabulary_set&status=approved
  → Lọc yêu cầu đã duyệt cho bộ từ vựng
```

---

### 4.14. Learning Stats - Thống Kê Học Tập

#### 4.14.1. Lấy thống kê học tập của user

```
GET /learning-stats
```

**Xác thực:** `requireAuth`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy thống kê học tập thành công",
  "data": {
    "totalVocabularySets": 10,
    "totalVocabularyLearned": 250,
    "totalPracticeSessions": 45,
    "averageScore": 78,
    "readingLessonsCompleted": 15,
    "listeningLessonsCompleted": 12,
    "currentStreak": 7,
    "totalDaysActive": 30
  }
}
```

### 4.15. Leaderboard - Bảng Xếp Hạng

#### 4.15.1. Lấy bảng xếp hạng

```
GET /leaderboard
```

**Xác thực:** `verifyToken` + `requireAuth`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `10` | `50` | Số item trên trang |

**Ví dụ:**
```
GET /api/v1/leaderboard?page=1&limit=10
```

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy bảng xếp hạng thành công",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "uuid",
        "user_name": "Nguyễn Văn A",
        "practice_count": 25,
        "avg_score": 88.5,
        "score": 885
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    },
    "current_user_rank": 12
  }
}
```

**Chi tiết trường phản hồi:**

| Trường | Kiểu | Mô tả |
|--------|------|--------|
| `leaderboard` | array | Danh sách người dùng trong bảng xếp hạng |
| `leaderboard[].rank` | number | Thứ hạng trên trang hiện tại |
| `leaderboard[].user_id` | uuid | ID người dùng |
| `leaderboard[].user_name` | string | Tên hiển thị ("Người dùng ẩn danh" nếu không có) |
| `leaderboard[].practice_count` | number | Tổng số lượt luyện tập |
| `leaderboard[].avg_score` | number | Điểm trung bình (làm tròn 1 chữ số thập phân) |
| `leaderboard[].score` | number | Điểm xếp hạng tổng |
| `pagination.page` | number | Trang hiện tại |
| `pagination.limit` | number | Số item mỗi trang |
| `pagination.total` | number | Tổng số người dùng trong bảng xếp hạng |
| `pagination.totalPages` | number | Tổng số trang |
| `current_user_rank` | number \| null | Thứ hạng của người dùng hiện tại (null nếu chưa có lượt làm nào) |

**Công thức tính điểm xếp hạng:**

```
score = avg_score * 10 + practice_count
```

| Người dùng | Điểm TB | Lượt làm | Tính điểm | Tổng |
|------------|---------|----------|------------|------|
| A | 88.5 | 25 | 88.5×10 + 25 | **910** |
| B | 80.0 | 50 | 80×10 + 50 | **850** |
| C | 85.0 | 10 | 85×10 + 10 | **860** |

> **Nguyên tắc:** Điểm trung bình có trọng số gấp 10 lần số lượt làm. Người có điểm trung bình cao luôn xếp trên người có nhiều lượt làm nhưng điểm thấp hơn. Điều này ngăn chặn việc spam lượt làm để leo top.

**Quy tắc sắp xếp khi điểm bằng nhau:**
1. Ưu tiên `avg_score` cao hơn
2. Nếu vẫn bằng, ưu tiên `practice_count` nhiều hơn

---

### 4.16. Explain By AI - Giải Thích Đáp Án Bằng AI

#### 4.16.1. Giải thích chi tiết đáp án

```
POST /explain-by-ai
```

**Xác thực:** `verifyToken` + `requireAuth`

**Mô tả:** Gọi AI (OpenRouter) để giải thích chi tiết đáp án cho bài luyện đọc hoặc luyện nghe. Giúp người dùng hiểu rõ hơn khi chưa nắm được nội dung. Kết quả trả về ngay lập tức mà không lưu vào database.

**Request Body:**
```json
{
  "lessonType": "reading",
  "content": "The rapid advancement of technology has transformed...",
  "viTranslation": "Sự phát triển nhanh chóng của công nghệ đã thay đổi...",
  "question": "What is the main topic of the passage?",
  "allAnswers": {
    "a": "The impact of technology on daily life",
    "b": "The history of computers",
    "c": "The dangers of social media",
    "d": "The future of artificial intelligence"
  },
  "userAnswer": "A",
  "correctAnswer": "B"
}
```

|| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `lessonType` | string | **Có** | Loại bài: `reading` (luyện đọc) hoặc `listening` (luyện nghe) |
| `content` | string | **Có** | Nội dung bài đọc hoặc transcript bài nghe bằng tiếng Anh (tối đa 10000 ký tự) |
| `viTranslation` | string | Không | Bản dịch tiếng Việt của nội dung (tối đa 10000 ký tự). Nếu không cung cấp, AI vẫn hoạt động bình thường |
| `question` | string | **Có** | Câu hỏi bằng tiếng Anh (tối đa 2000 ký tự) |
| `allAnswers` | object | **Có** | Tất cả 4 đáp án (A, B, C, D), mỗi đáp án tối đa 500 ký tự |
| `allAnswers.a` | string | **Có** | Nội dung đáp án A |
| `allAnswers.b` | string | **Có** | Nội dung đáp án B |
| `allAnswers.c` | string | **Có** | Nội dung đáp án C |
| `allAnswers.d` | string | **Có** | Nội dung đáp án D |
| `userAnswer` | string | **Có** | Đáp án người dùng đã chọn (`A`, `B`, `C` hoặc `D`, không phân biệt hoa thường) |
| `correctAnswer` | string | **Có** | Đáp án đúng (`A`, `B`, `C` hoặc `D`, không phân biệt hoa thường) |

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Giải thích chi tiết đáp án thành công",
  "data": {
    "explanation": "1. [Tóm tắt câu hỏi] — Dịch câu hỏi ra tiếng Việt...\n2. [Phân tích đáp án đúng] — Giải thích chi tiết..."
  }
}
```

**Lưu ý:**
- Giải thích hoàn toàn bằng tiếng Việt, trích dẫn câu/cụm từ tiếng Anh trong nội dung bài gốc.
- Cấu trúc giải thích gồm 4 phần: Tóm tắt câu hỏi, Phân tích đáp án đúng, Phân tích các đáp án sai, Ghi chú từ vựng/ngữ pháp.
- Không lưu vào database.
- Nếu bị rate limit, hệ thống tự động thử model dự phòng (Gemma → Gemma 31B → Claude Haiku).

**Các trường hợp lỗi:**

|| Mã | Thông báo | Điều kiện |
|----|-----------|-----------|
| 400 | "lessonType phải là 'reading' hoặc 'listening'" | Giá trị lessonType không hợp lệ |
| 400 | "Nội dung bài đọc hoặc transcript không được để trống" | content rỗng |
| 400 | "Nội dung không được dài quá 10000 ký tự" | content vượt giới hạn |
| 400 | "Câu hỏi không được để trống" | question rỗng |
| 400 | "Phải cung cấp đầy đủ 4 đáp án A, B, C, D" | Thiếu đáp án |
| 500 | "API_KEY chưa được cấu hình" | Biến API_KEY chưa được set trong .env |
| 502 | "Lỗi từ dịch vụ AI" | OpenRouter API trả lỗi |
tOrder=desc
  → Tìm user thường, email gmail, đang active, mới nhất trước

GET /api/v1/admin/users?role=admin&limit=5
  → Xem 5 admin đầu tiên

GET /api/v1/admin/users?status=inactive&sortField=created_at&sortOrder=asc
  → Xem tài khoản bị khóa, cũ nhất trước
```

---

#### 5.2.2. Lấy chi tiết người dùng

```
GET /admin/users/:id
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireAdmin`

---

#### 5.2.3. Cập nhật trạng thái người dùng

```
PATCH /admin/users/status
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireAdmin`

**Request Body:**
```json
{
  "userIds": ["uuid-1", "uuid-2"],
  "status": "inactive"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `userIds` | array[uuid] | **Có** | Danh sách ID người dùng (1-100 user) |
| `status` | string | **Có** | Trạng thái mới: `active`, `inactive` |

---

#### 5.2.4. Cấp hoặc thu hồi vai trò người dùng

```
PATCH /admin/users/roles
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireAdmin`

**Request Body:**
```json
{
  "userId": "uuid",
  "role": "content_manager",
  "action": "grant"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `userId` | uuid | **Có** | ID người dùng |
| `role` | string | **Có** | Vai trò: `user`, `content_manager`, `admin` |
| `action` | string | **Có** | Thao tác: `grant` (cấp), `revoke` (thu hồi) |

---

#### 5.2.5. Xóa tài khoản người dùng

```
DELETE /admin/users/:id
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireAdmin`

**Lưu ý:** Chỉ xóa được tài khoản đang ở trạng thái `inactive`. Xóa vĩnh viễn khỏi hệ thống.

---

### 5.3. Admin Stats - Thống Kê Hệ Thống

#### 5.3.1. Lấy thống kê toàn hệ thống

```
GET /admin/stats
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireAdmin`

**Phản hồi (200):**
```json
{
  "code": 200,
  "success": true,
  "message": "Lấy thống kê hệ thống thành công",
  "data": {
    "totalUsers": 1000,
    "activeUsers": 850,
    "inactiveUsers": 150,
    "totalVocabularySets": 500,
    "publicVocabularySets": 300,
    "pendingVocabularySets": 50,
    "totalReadingLessons": 200,
    "publicReadingLessons": 150,
    "pendingReadingLessons": 20,
    "totalListeningLessons": 180,
    "publicListeningLessons": 120,
    "pendingListeningLessons": 30,
    "totalPracticeSessions": 5000,
    "totalModerationRequests": 100,
    "pendingModerationRequests": 10
  }
}
```

---

### 5.4. Admin Vocabulary Sets - Duyệt Bộ Từ Vựng

#### 5.4.1. Lấy danh sách bộ từ vựng chờ duyệt

```
GET /admin/vocabulary-sets/pending
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `15` | `15` | Số item trên trang |
| `keyword` | string | `""` | - | Tìm kiếm theo tiêu đề bộ từ vựng |

**Ví dụ:**
```
GET /api/v1/admin/vocabulary-sets/pending?page=1&limit=10&keyword=IELTS
```

---

#### 5.4.2. Duyệt công khai bộ từ vựng

```
POST /admin/vocabulary-sets/:id/approve
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.4.3. Từ chối duyệt bộ từ vựng

```
POST /admin/vocabulary-sets/:id/reject
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

### 5.5. Admin Reading Lessons - Duyệt Bài Đọc

#### 5.5.1. Lấy danh sách bài luyện đọc chờ duyệt

```
GET /admin/reading-lessons/pending
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `15` | `15` | Số item trên trang |
| `keyword` | string | `""` | - | Tìm kiếm theo tiêu đề bài luyện đọc |

---

#### 5.5.2. Duyệt công khai bài luyện đọc

```
POST /admin/reading-lessons/:id/approve
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.5.3. Từ chối duyệt bài luyện đọc

```
POST /admin/reading-lessons/:id/reject
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

### 5.6. Admin Listening Lessons - Duyệt Bài Nghe

#### 5.6.1. Lấy danh sách bài luyện nghe chờ duyệt

```
GET /admin/listening-lessons/pending
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Query Parameters:** Tương tự Admin Reading Lessons

---

#### 5.6.2. Duyệt công khai bài luyện nghe

```
POST /admin/listening-lessons/:id/approve
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.6.3. Từ chối duyệt bài luyện nghe

```
POST /admin/listening-lessons/:id/reject
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

### 5.7. Admin Moderation - Kiểm Duyệt Nội Dung

#### 5.7.1. Lấy danh sách yêu cầu kiểm duyệt bộ từ vựng

```
GET /admin/moderation/vocabulary-sets
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Tối đa | Mô tả |
|---------|------|-----------|---------|--------|
| `page` | number | `1` | - | Số trang |
| `limit` | number | `15` | `15` | Số item trên trang |
| `sortField` | string | `"created_at"` | - | Trường sắp xếp: `created_at` (ngày gửi) |
| `sortOrder` | string | `"desc"` | - | Thứ tự: `asc`, `desc` |
| `status` | string | `""` | - | Lọc: `pending`, `approved`, `rejected` |

---

#### 5.7.2. Lấy danh sách yêu cầu kiểm duyệt bài luyện đọc

```
GET /admin/moderation/reading-lessons
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Query Parameters:** Tương tự `/admin/moderation/vocabulary-sets`

---

#### 5.7.3. Lấy danh sách yêu cầu kiểm duyệt bài luyện nghe

```
GET /admin/moderation/listening-lessons
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Query Parameters:** Tương tự `/admin/moderation/vocabulary-sets`

---

#### 5.7.4. Lấy chi tiết yêu cầu kiểm duyệt

```
GET /admin/moderation/requests/:requestId
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.7.5. Phê duyệt hoặc từ chối yêu cầu kiểm duyệt

```
POST /admin/moderation/requests/:requestId/review
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

**Request Body:**
```json
{
  "action": "approve",
  "reason": "Nội dung đạt chất lượng",
  "notes": "Bổ sung thêm ví dụ cho một số từ"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|--------|
| `action` | string | **Có** | Hành động: `approve`, `reject` |
| `reason` | string | Không | Lý do phê duyệt/từ chối |
| `notes` | string | Không | Ghi chú thêm |

---

#### 5.7.6. Chỉnh sửa bộ từ vựng (khi đang pending)

```
PATCH /admin/moderation/vocabulary-sets/:id
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.7.7. Thêm từ vào bộ từ vựng (khi đang pending)

```
POST /admin/moderation/vocabulary-sets/:id/words
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.7.8. Xóa từ khỏi bộ từ vựng (khi đang pending)

```
DELETE /admin/moderation/vocabulary-sets/:id/words
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.7.9. Chỉnh sửa bài luyện đọc (khi đang pending)

```
PATCH /admin/moderation/reading-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.7.10. Chỉnh sửa câu hỏi đọc hiểu (khi bài đang pending)

```
PATCH /admin/moderation/reading-questions/:questionId
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.7.11. Chỉnh sửa bài luyện nghe (khi đang pending)

```
PATCH /admin/moderation/listening-lessons/:id
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

#### 5.7.12. Chỉnh sửa câu hỏi nghe hiểu (khi bài đang pending)

```
PATCH /admin/moderation/listening-questions/:questionId
```

**Xác thực:** `verifyToken` + `requireAuth` + `requireManagerOrAdmin`

---

## 6. Mã Trạng Thái

| Mã HTTP | Mô tả |
|---------|--------|
| 200 | OK - Yêu cầu thành công |
| 201 | Created - Tạo mới thành công |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy tài nguyên |
| 409 | Conflict - Yêu cầu đã tồn tại |
| 429 | Too Many Requests - Quá nhiều yêu cầu (rate limit) |
| 500 | Internal Server Error - Lỗi server |

---

## 7. Cấu Trúc Phản Hồi

### 7.1. Phản hồi thành công có phân trang

```json
{
  "code": 200,
  "success": true,
  "message": "Thông điệp thành công",
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 15,
    "totalPages": 7
  }
}
```

### 7.2. Phản hồi thành công không phân trang

```json
{
  "code": 200,
  "success": true,
  "message": "Thông điệp thành công",
  "data": { ... }
}
```

### 7.3. Phản hồi lỗi

```json
{
  "code": 400,
  "success": false,
  "message": "Thông báo lỗi"
}
```

### 7.4. Phản hồi lỗi với chi tiết validation

```json
{
  "code": 400,
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "index": 0,
      "errors": [
        { "field": "wordId", "message": "wordId phải là UUID hợp lệ" }
      ]
    }
  ]
}
```

---

## 8. Rate Limiting

| Endpoint | Giới hạn |
|----------|--------|
| `/auth/register` | 5 lần / 15 phút / IP |
| `/auth/login` | 5 lần / 15 phút / IP |
| `/auth/request-otp` | 3 lần / 15 phút / IP |

---

## 9. Trạng Thái Nội Dung

| Trạng thái | Mô tả |
|------------|--------|
| `private` | Riêng tư, chỉ chủ sở hữu thấy |
| `req_public` | Đã gửi yêu cầu công khai, đang chờ duyệt |
| `public` | Đã được duyệt, hiển thị công khai |
| `pending` | Đang chờ kiểm duyệt |
| `approved` | Đã được duyệt |
| `rejected` | Đã bị từ chối |
| `active` | Tài khoản đang hoạt động |
| `inactive` | Tài khoản bị vô hiệu hóa |

---

> **Tài liệu được tạo tự động từ mã nguồn backend.**
> **Nếu có thắc mắc hoặc cần cập nhật, vui lòng liên hệ đội phát triển.**
