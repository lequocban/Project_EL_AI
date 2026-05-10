# API Documentation - Client

Tai lieu thong ke chi tiet cac API phia client (backend/api/v1) phuc vu frontend.

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:** Cac endpoint can xac thuc gui kem `Authorization: Bearer <accessToken>` trong header.

**Format Response Chung:**

Thanh cong:
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Mo ta thanh cong"
}
```

Loi:
```json
{
  "code": 400,
  "success": false,
  "message": "Thong bao loi"
}
```

**Format Phan Trang:** Cac endpoint danh sach (list) tra ve:
```json
{
  "items": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 100,
    "totalPages": 7
  }
}
```

---

## Muc Luc

1. [Authentication](#1-authentication)
2. [Profile](#2-profile)
3. [Vocabulary](#3-vocabulary)
4. [Vocabulary Sets](#4-vocabulary-sets)
5. [Practice (Vocabulary)](#5-practice-vocabulary)
6. [Favorite Vocabulary Sets](#6-favorite-vocabulary-sets)
7. [Reading Lessons](#7-reading-lessons)
8. [Reading Questions](#8-reading-questions)
9. [Reading Practice](#9-reading-practice)
10. [Listening Lessons](#10-listening-lessons)
11. [Listening Questions](#11-listening-questions)
12. [Listening Practice](#12-listening-practice)
13. [Moderation Requests](#13-moderation-requests)
14. [Learning Stats](#14-learning-stats)

---

## 1. Authentication

### 1.1 Dang ky tai khoan

**POST** `/auth/register`

Yeu cau: Khong can token (rate limit 5 requests/1 phut).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "userName": "Nguyen Van A",
  "dayOfBirth": "01/01/2000"
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| email | string | Co | Dia chi email (valid email format, tu dong chuyen thanh chu thuong) |
| password | string | Co | Mat khau (toi thieu 8 ky tu, it nhat 1 chu hoa, 1 chu so) |
| userName | string | Khong | Ten hien thi (2-50 ky tu) |
| dayOfBirth | string | Khong | Ngay sinh dinh dang DD/MM/YYYY |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "accessToken": "jwt-access-token",
    "expiresAt": 1234567890,
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "message": "Dang ky thanh cong"
}
```

---

### 1.2 Dang nhap

**POST** `/auth/login`

Yeu cau: Khong can token (rate limit 10 requests/1 phut).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "accessToken": "jwt-access-token",
    "expiresAt": 1234567890,
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "message": "Dang nhap thanh cong"
}
```

---

### 1.3 Dang xuat

**POST** `/auth/logout`

Yeu cau: `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": null,
  "message": "Dang xuat thanh cong"
}
```

---

### 1.4 Lam moi Access Token

**POST** `/auth/refresh-token`

**Request Body (可选):**
```json
{
  "refreshToken": "refresh-token-value"
}
```
Hoac gui qua cookie `refresh_token`.

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "expiresAt": 1234567890,
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "message": "Lam moi token thanh cong"
}
```

---

### 1.5 Gui ma OTP

**POST** `/auth/request-otp`

Yeu cau: Khong can token da dang nhap.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": null,
  "message": "Ma OTP da duoc gui den email cua ban"
}
```

---

### 1.6 Dat lai mat khau bang OTP

**POST** `/auth/reset-password`

Yeu cau: Khong can token da dang nhap.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| email | string | Co | Email tai khoan |
| otp | string | Co | Ma OTP 6 chu so |
| newPassword | string | Co | Mat khau moi (8+ ky tu, 1 chu hoa, 1 chu so) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": null,
  "message": "Dat lai mat khau thanh cong"
}
```

---

### 1.7 Doi mat khau

**PATCH** `/auth/change-password`

Yeu cau: `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": null,
  "message": "Doi mat khau thanh cong"
}
```

---

## 2. Profile

Base path: `/profile`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 2.1 Lay thong tin ho so

**GET** `/profile/me`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "email": "user@example.com",
    "userName": "Nguyen Van A",
    "dayOfBirth": "01/01"
  },
  "message": "Lay thong tin ho so thanh cong"
}
```

---

### 2.2 Cap nhat ho so

**PATCH** `/profile/me`

**Request Body:**
```json
{
  "userName": "Nguyen Van B",
  "dayOfBirth": "15/05/1995"
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| userName | string | Khong | Ten hien thi (2-50 ky tu) |
| dayOfBirth | string | Khong | Ngay sinh dinh dang DD/MM/YYYY |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "email": "user@example.com",
    "userName": "Nguyen Van B",
    "dayOfBirth": "15/05"
  },
  "message": "Cap nhat ho so thanh cong"
}
```

---

## 3. Vocabulary

Base path: `/vocabulary`

### 3.1 Tra cuu tu vung

**POST** `/vocabulary/lookup`

Yeu cau: `Authorization: Bearer <accessToken>`

Tra cuu tu vung: neu co trong DB thi tra ve, neu chua co thi goi Dictionary API + Google Translate va luu vao DB.

**Request Body:**
```json
{
  "word": "hello"
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| word | string | Co | Tu can tra (1-100 ky tu, tu dong chuyen thanh chu thuong) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "word": "hello",
    "meaning": "xin chao",
    "phonetic": "/həˈloʊ/",
    "audioUrl": "https://...",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "updatedAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Tra cuu tu vung thanh cong"
}
```

---

## 4. Vocabulary Sets

Base path: `/vocabulary-sets`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 4.1 Tao bo tu vung moi

**POST** `/vocabulary-sets`

**Request Body:**
```json
{
  "title": "English Vocabulary - Travel",
  "description": "Tu vung lien quan den du lich"
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| title | string | Co | Tieu de bo tu vung (1-255 ky tu) |
| description | string | Khong | Mo ta (toi da 1000 ky tu) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "English Vocabulary - Travel",
    "description": "Tu vung lien quan den du lich",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "updatedAt": "2026-05-10T00:00:00.000Z",
    "deleted": false
  },
  "message": "Tao bo tu vung thanh cong"
}
```

---

### 4.2 Danh sach bo tu vung cua toi

**GET** `/vocabulary-sets/my`

**Query Parameters:**
| Param | Kieu | Mac dinh | Mo ta |
|-------|------|----------|-------|
| page | number | 1 | So trang |
| limit | number | 15 | So item moi trang (toi da 15) |
| keyword | string | "" | Tu khoa tim kiem theo tieu de |
| sortField | string | "" | Ten truong sap xep (title, created_at) |
| sortOrder | string | "" | Thu tu (asc, desc) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "English Vocabulary - Travel",
        "description": "Tu vung lien quan den du lich",
        "wordCount": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 15,
      "total": 10,
      "totalPages": 1
    }
  },
  "message": "Lay danh sach bo tu vung thanh cong"
}
```

---

### 4.3 Danh sach bo tu vung public

**GET** `/vocabulary-sets/public`

**Query Parameters:** Giong nhu `/my`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Business English",
        "description": "Tu vung thuong mai",
        "wordCount": 30
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay danh sach bo tu vung public thanh cong"
}
```

---

### 4.4 Chi tiet bo tu vung

**GET** `/vocabulary-sets/:id`

**Query Parameters:**
| Param | Kieu | Mo ta |
|-------|------|-------|
| sortField | string | Truong sap xep (word, meaning, phonetic) |
| sortOrder | string | Thu tu (asc, desc) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "English Vocabulary - Travel",
    "description": "Tu vung lien quan den du lich",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "updatedAt": "2026-05-10T00:00:00.000Z",
    "wordCount": 25,
    "words": [
      {
        "id": "word-uuid",
        "word": "airport",
        "phonetic": "/ˈeərpɔːrt/",
        "audioUrl": "https://...",
        "meaning": "san bay",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ]
  },
  "message": "Lay chi tiet bo tu vung thanh cong"
}
```

---

### 4.5 Cap nhat bo tu vung

**PATCH** `/vocabulary-sets/:id`

**Request Body:**
```json
{
  "title": "Travel Vocabulary - Updated",
  "description": "Bo tu vung du lich da cap nhat"
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Travel Vocabulary - Updated",
    "description": "Bo tu vung du lich da cap nhat",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "updatedAt": "2026-05-11T00:00:00.000Z",
    "deleted": false
  },
  "message": "Cap nhat bo tu vung thanh cong"
}
```

---

### 4.6 Xoa bo tu vung (xoa mem)

**DELETE** `/vocabulary-sets/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Xoa bo tu vung thanh cong"
}
```

---

### 4.7 Tao bo tu vung bang AI

**POST** `/vocabulary-sets/generate-words`

Tao bo tu vung moi roi sinh tu vung bang AI dua tren chu de.

**Request Body:**
```json
{
  "title": "Technology Vocabulary",
  "description": "Tu vung cong nghe",
  "topic": "artificial intelligence, machine learning, blockchain",
  "wordCount": 10
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| title | string | Co | Tieu de bo tu vung (1-255 ky tu) |
| description | string | Khong | Mo ta (toi da 1000 ky tu) |
| topic | string | Co | Chu de sinh tu (1-500 ky tu) |
| wordCount | number | Khong | So tu muon sinh (1-30, mac dinh 10) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "setId": "uuid",
    "addedCount": 10,
    "totalWords": 10
  },
  "message": "Tao bo tu vung va sinh tu bang AI thanh cong"
}
```

---

### 4.8 Them tu vao bo tu vung

**POST** `/vocabulary-sets/:id/words`

Them nhieu tu vao bo tu vung. Neu tu chua co trong DB thi tu dong tra cuu bang API.

**Request Body:**
```json
{
  "words": ["hello", "goodbye", "thank you"]
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| words | string[] | Co | Danh sach tu (1-100 tu moi lan them) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "setId": "uuid",
    "addedCount": 3,
    "totalWords": 28
  },
  "message": "Them tu vao bo tu vung thanh cong"
}
```

---

### 4.9 Xoa tu khoi bo tu vung

**DELETE** `/vocabulary-sets/:id/words/remove`

**Request Body:**
```json
{
  "wordIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| wordIds | string[] | Co | Danh sach ID tu vung (UUID, 1-100 tu) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "setId": "uuid",
    "removedCount": 3,
    "totalWords": 25
  },
  "message": "Xoa tu vung khoi bo thanh cong"
}
```

---

### 4.10 Yeu cau public bo tu vung

**POST** `/vocabulary-sets/:id/request-public`

Chuyen trang thai tu `private` thanh `req_public` de cho admin duyet.

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "status": "req_public",
    "createdBy": "user-uuid",
    "createdAt": "...",
    "updatedAt": "...",
    "deleted": false
  },
  "message": "Yeu cau public bo tu vung thanh cong"
}
```

---

### 4.11 Chuyen bo tu vung ve che do rieng tu

**POST** `/vocabulary-sets/:id/make-private`

Chuyen trang thai tu `public` ve `private`. Chi ap dung khi trang thai hien tai la `public`.

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Chuyen bo tu vung sang che do private thanh cong"
}
```

---

## 5. Practice (Vocabulary)

Base path: `/vocabulary-sets/practice`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 5.1 Nop bai luyen tap tu vung

**POST** `/vocabulary-sets/practice/submit`

**Request Body:**
```json
{
  "setId": "uuid-cua-bo-tu-vung",
  "type": "quiz",
  "timeSpent": 120,
  "answers": [
    { "wordId": "uuid-tu-1", "answer": "xin chao" },
    { "wordId": "uuid-tu-2", "answer": "tam biet" }
  ]
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| setId | string | Co | UUID cua bo tu vung |
| type | string | Co | Loai bai tap: `quiz`, `listening_quiz`, `translate_write`, `listen_write` |
| timeSpent | number | Khong | Thoi gian lam bai (giay) |
| answers | array | Co | Danh sach dap an |

**Doi voi type `quiz` hoac `listening_quiz`:**
```json
"answers": [
  { "wordId": "uuid", "answer": "nghia tieng Viet" }
]
```

**Doi voi type `translate_write` hoac `listen_write`:**
```json
"answers": [
  { "wordId": "uuid", "answer": "tu tieng Anh" }
]
```

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "practiceId": "uuid",
    "score": 80,
    "totalQuestions": 10,
    "correctCount": 8,
    "wrongCount": 2,
    "wrongWords": [
      {
        "word_id": "uuid",
        "word": "goodbye",
        "user_answer": "xin chao",
        "correct_answer": "tam biet"
      }
    ],
    "timeSpent": 120,
    "completedAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Nop bai luyen tap thanh cong"
}
```

---

### 5.2 Lay lich su luyen tap

**GET** `/vocabulary-sets/practice/history`

**Query Parameters:**
| Param | Kieu | Mac dinh | Mo ta |
|-------|------|----------|-------|
| page | number | 1 | So trang |
| limit | number | 10 | So item moi trang (toi da 20) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "score": 80,
        "type": "quiz",
        "timeSpent": 120,
        "wrongWords": [ ... ],
        "completedAt": "2026-05-10T00:00:00.000Z",
        "vocabularySetTitle": "Travel Vocabulary"
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay lich su luyen tap thanh cong"
}
```

---

## 6. Favorite Vocabulary Sets

Base path: `/favorites`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 6.1 Them bo tu vung vao yeu thich

**POST** `/favorites/vocabulary-sets/:id`

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "vocabularyId": "uuid"
  },
  "message": "Them vao yeu thich thanh cong"
}
```

---

### 6.2 Xoa bo tu vung khoi yeu thich

**DELETE** `/favorites/vocabulary-sets/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": null,
  "message": "Xoa khoi yeu thich thanh cong"
}
```

---

### 6.3 Danh sach bo tu vung yeu thich

**GET** `/favorites/vocabulary-sets`

**Query Parameters:**
| Param | Kieu | Mac dinh | Mo ta |
|-------|------|----------|-------|
| page | number | 1 | So trang |
| limit | number | 15 | So item moi trang |
| keyword | string | "" | Tu khoa tim kiem |
| sortField | string | "" | Truong sap xep |
| sortOrder | string | "" | Thu tu (asc, desc) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Business English",
        "description": "Tu vung thuong mai",
        "wordCount": 30
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay danh sach yeu thich thanh cong"
}
```

---

## 7. Reading Lessons

Base path: `/reading-lessons`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 7.1 Tao bai luyen doc bang AI

**POST** `/reading-lessons/generate-with-ai`

**Request Body:**
```json
{
  "title": "The Future of Technology",
  "topic": "artificial intelligence and its impact on daily life",
  "questionCount": 5
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| title | string | Co | Tieu de bai luyen doc (1-255 ky tu) |
| topic | string | Co | Chu de noi dung bai doc (1-500 ky tu) |
| questionCount | number | Khong | So cau hoi (1-5, mac dinh 5) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "The Future of Technology",
    "content": "The full English text...",
    "viTranslation": "Van ban tieng Viet...",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "questions": [
      {
        "id": "question-uuid",
        "question": "What is the main topic?",
        "optionA": "Sports",
        "optionB": "Technology",
        "optionC": "Politics",
        "optionD": "Education",
        "correctAnswer": "B",
        "explain": "...",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ]
  },
  "message": "Tao bai luyen doc bang AI thanh cong"
}
```

---

### 7.2 Tao bai luyen doc moi

**POST** `/reading-lessons`

**Request Body:**
```json
{
  "title": "My Reading Lesson",
  "content": "The English content of the lesson...",
  "vi_translation": "Noi dung tieng Viet..."
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| title | string | Co | Tieu de (1-255 ky tu) |
| content | string | Khong | Noi dung bai doc (toi da 50000 ky tu) |
| vi_translation | string | Khong | Ban dich tieng Viet (toi da 50000 ky tu) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Reading Lesson",
    "content": "The English content...",
    "viTranslation": "Noi dung tieng Viet...",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Tao bai luyen doc thanh cong"
}
```

---

### 7.3 Danh sach bai luyen doc cua toi

**GET** `/reading-lessons/my`

**Query Parameters:**
| Param | Kieu | Mac dinh | Mo ta |
|-------|------|----------|-------|
| page | number | 1 | So trang |
| limit | number | 15 | So item moi trang |
| keyword | string | "" | Tu khoa tim kiem theo tieu de |
| sortField | string | "" | Truong sap xep (title, created_at) |
| sortOrder | string | "" | Thu tu (asc, desc) |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "My Reading Lesson",
        "status": "private",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay danh sach bai luyen doc thanh cong"
}
```

---

### 7.4 Danh sach bai luyen doc public

**GET** `/reading-lessons/public`

**Query Parameters:** Giong nhu `/my`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Technology Article",
        "content": "The full content...",
        "viTranslation": "Noi dung tieng Viet...",
        "status": "public",
        "createdBy": "another-user-uuid",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay danh sach bai luyen doc public thanh cong"
}
```

---

### 7.5 Chi tiet bai luyen doc

**GET** `/reading-lessons/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Reading Lesson",
    "content": "The full English text...",
    "viTranslation": "Noi dung tieng Viet...",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "questions": [
      {
        "id": "question-uuid",
        "question": "What is the main topic?",
        "optionA": "Sports",
        "optionB": "Technology",
        "optionC": "Politics",
        "optionD": "Education",
        "correctAnswer": "B",
        "explain": "...",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ]
  },
  "message": "Lay chi tiet bai luyen doc thanh cong"
}
```

---

### 7.6 Cap nhat bai luyen doc

**PATCH** `/reading-lessons/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "vi_translation": "Updated Vietnamese translation..."
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "content": "Updated content...",
    "viTranslation": "Updated Vietnamese...",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Cap nhat bai luyen doc thanh cong"
}
```

---

### 7.7 Xoa bai luyen doc (xoa mem)

**DELETE** `/reading-lessons/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Xoa bai luyen doc thanh cong"
}
```

---

### 7.8 Yeu cau public bai luyen doc

**POST** `/reading-lessons/:id/request-public`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "status": "req_public",
    "createdBy": "user-uuid",
    "createdAt": "...",
    ...
  },
  "message": "Yeu cau public bai luyen doc thanh cong"
}
```

---

### 7.9 Chuyen bai luyen doc ve che do rieng tu

**POST** `/reading-lessons/:id/make-private`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Chuyen bai luyen doc ve che do rieng tu thanh cong"
}
```

---

## 8. Reading Questions

Co 2 nhom route:

- **Nested:** `/reading-lessons/:lessonId/questions` - Lam viec voi cau hoi thuoc 1 lesson
- **Standalone:** `/reading-questions` - Lam viec truc tiep voi cau hoi

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 8.1 Tao cau hoi cho bai luyen doc

**POST** `/reading-lessons/:lessonId/questions`

**Request Body:**
```json
{
  "question": "What is the main idea of the passage?",
  "option_a": "Sports",
  "option_b": "Technology",
  "option_c": "Politics",
  "option_d": "Education",
  "correct_answer": "B",
  "explain": "The passage is about technology..."
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| question | string | Co | Noi dung cau hoi (1-2000 ky tu) |
| option_a | string | Co | Dap an A (toi da 1000 ky tu) |
| option_b | string | Co | Dap an B (toi da 1000 ky tu) |
| option_c | string | Khong | Dap an C (toi da 1000 ky tu) |
| option_d | string | Khong | Dap an D (toi da 1000 ky tu) |
| correct_answer | string | Co | Dap an dung (A/B/C/D) |
| explain | string | Khong | Giai thich (toi da 2000 ky tu) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "id": "question-uuid",
    "lessonId": "lesson-uuid",
    "question": "What is the main idea of the passage?",
    "optionA": "Sports",
    "optionB": "Technology",
    "optionC": "Politics",
    "optionD": "Education",
    "correctAnswer": "B",
    "explain": "The passage is about technology...",
    "createdAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Tao cau hoi thanh cong"
}
```

---

### 8.2 Tao nhieu cau hoi

**POST** `/reading-lessons/:lessonId/questions/bulk`

**Request Body:**
```json
{
  "questions": [
    {
      "question": "Question 1?",
      "option_a": "A1",
      "option_b": "B1",
      "option_c": "C1",
      "option_d": "D1",
      "correct_answer": "A",
      "explain": "..."
    },
    {
      "question": "Question 2?",
      "option_a": "A2",
      "option_b": "B2",
      "correct_answer": "B"
    }
  ]
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| questions | array | Co | Danh sach cau hoi (1-50 cau moi lan tao) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "lessonId": "lesson-uuid",
      "question": "Question 1?",
      "optionA": "A1",
      "optionB": "B1",
      "optionC": "C1",
      "optionD": "D1",
      "correctAnswer": "A",
      "explain": "...",
      "createdAt": "..."
    }
  ],
  "message": "Tao nhieu cau hoi thanh cong"
}
```

---

### 8.3 Lay danh sach cau hoi cua bai luyen doc

**GET** `/reading-lessons/:lessonId/questions`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": [
    {
      "id": "question-uuid",
      "lessonId": "lesson-uuid",
      "question": "What is the main idea?",
      "optionA": "Sports",
      "optionB": "Technology",
      "optionC": "Politics",
      "optionD": "Education",
      "correctAnswer": "B",
      "explain": "...",
      "createdAt": "2026-05-10T00:00:00.000Z"
    }
  ],
  "message": "Lay danh sach cau hoi thanh cong"
}
```

---

### 8.4 Cap nhat cau hoi

**PATCH** `/reading-questions/:id`

**Request Body:** Giong nhu tao cau hoi, cac truong deu la optional.

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "question-uuid",
    "lessonId": "lesson-uuid",
    "question": "Updated question?",
    "optionA": "...",
    "optionB": "...",
    "optionC": null,
    "optionD": null,
    "correctAnswer": "A",
    "explain": "...",
    "createdAt": "..."
  },
  "message": "Cap nhat cau hoi thanh cong"
}
```

---

### 8.5 Xoa mot cau hoi

**DELETE** `/reading-questions/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Xoa cau hoi thanh cong"
}
```

---

### 8.6 Xoa nhieu cau hoi

**DELETE** `/reading-questions/bulk`

**Request Body:**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "deletedCount": 3
  },
  "message": "Xoa cau hoi thanh cong"
}
```

---

## 9. Reading Practice

Base path: `/reading-lessons`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 9.1 Nop bai luyen doc

**POST** `/reading-lessons/:lessonId/practice/submit`

**Request Body:**
```json
{
  "answers": [
    { "questionId": "uuid-cau-hoi-1", "answer": "B" },
    { "questionId": "uuid-cau-hoi-2", "answer": "A" },
    { "questionId": "uuid-cau-hoi-3", "answer": "C" }
  ]
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| answers | array | Co | Danh sach dap an (1-10 ky tu moi dap an) |
| answers[].questionId | string | Co | UUID cua cau hoi |
| answers[].answer | string | Co | Dap an cua user (A/B/C/D) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "practiceId": "uuid",
    "score": 67,
    "totalQuestions": 3,
    "correctCount": 2,
    "wrongCount": 1,
    "results": [
      {
        "questionId": "uuid-1",
        "userAnswer": "B",
        "correctAnswer": "B",
        "isCorrect": true,
        "isSkipped": false
      },
      {
        "questionId": "uuid-2",
        "userAnswer": "A",
        "correctAnswer": "C",
        "isCorrect": false,
        "isSkipped": false
      }
    ],
    "completedAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Nop bai luyen doc thanh cong"
}
```

---

### 9.2 Lay lich su luyen doc

**GET** `/reading-lessons/practice/history`

**Query Parameters:**
| Param | Kieu | Mac dinh | Mo ta |
|-------|------|----------|-------|
| page | number | 1 | So trang |
| limit | number | 10 | So item moi trang (toi da 20) |
| sortField | string | "" | Truong sap xep |
| sortOrder | string | "" | Thu tu |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "score": 80,
        "completedAt": "2026-05-10T00:00:00.000Z",
        "lessonTitle": "Technology Article",
        "lessonId": "lesson-uuid"
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay lich su luyen doc thanh cong"
}
```

---

### 9.3 Chi tiet bai luyen doc da lam

**GET** `/reading-lessons/practice/:practiceId`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "practiceId": "uuid",
    "score": 67,
    "totalQuestions": 3,
    "correctCount": 2,
    "wrongCount": 1,
    "lesson": {
      "id": "lesson-uuid",
      "title": "Technology Article",
      "content": "The full content...",
      "viTranslation": "Noi dung tieng Viet..."
    },
    "questions": [
      {
        "questionId": "uuid-1",
        "question": "What is the main idea?",
        "options": {
          "A": "Sports",
          "B": "Technology",
          "C": "Politics",
          "D": "Education"
        },
        "userAnswer": "B",
        "correctAnswer": "B",
        "explain": "The passage is about technology...",
        "isCorrect": true
      }
    ],
    "completedAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Lay chi tiet bai luyen doc thanh cong"
}
```

---

## 10. Listening Lessons

Base path: `/listening-lessons`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 10.1 Tao bai luyen nghe bang AI

**POST** `/listening-lessons/generate-ai`

**Request Body:**
```json
{
  "title": "Daily Conversation",
  "topic": "ordering food at a restaurant",
  "questionCount": 5
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| title | string | Co | Tieu de bai luyen nghe (1-255 ky tu) |
| topic | string | Co | Chu de noi dung (1-500 ky tu) |
| questionCount | number | Khong | So cau hoi (1-5, mac dinh 5) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Daily Conversation",
    "audioUrl": "https://...",
    "transcript": "Full transcript...",
    "viTranslation": "Ban dich tieng Viet...",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "questions": [ ... ]
  },
  "message": "Tao bai luyen nghe bang AI thanh cong"
}
```

---

### 10.2 Tao bai luyen nghe moi

**POST** `/listening-lessons`

**Request Body:**
```json
{
  "title": "My Listening Lesson",
  "audioUrl": "https://example.com/audio.mp3",
  "transcript": "The conversation transcript...",
  "viTranslation": "Ban dich tieng Viet..."
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| title | string | Co | Tieu de (1-255 ky tu) |
| audioUrl | string | Khong | Link audio (toi da 2048 ky tu) |
| transcript | string | Khong | Ban ghi audio (toi da 50000 ky tu) |
| viTranslation | string | Khong | Ban dich tieng Viet (toi da 50000 ky tu) |

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Listening Lesson",
    "audioUrl": "https://example.com/audio.mp3",
    "transcript": "The conversation transcript...",
    "viTranslation": "Ban dich tieng Viet...",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Tao bai luyen nghe thanh cong"
}
```

---

### 10.3 Danh sach bai luyen nghe cua toi

**GET** `/listening-lessons/my`

**Query Parameters:** Giong nhu reading lessons.

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "My Listening Lesson",
        "status": "private",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay danh sach bai luyen nghe thanh cong"
}
```

---

### 10.4 Danh sach bai luyen nghe public

**GET** `/listening-lessons/public`

**Query Parameters:** Giong nhu `/my`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Restaurant Conversation",
        "audioUrl": "https://...",
        "transcript": "...",
        "viTranslation": "...",
        "status": "public",
        "createdBy": "another-user-uuid",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay danh sach bai luyen nghe public thanh cong"
}
```

---

### 10.5 Chi tiet bai luyen nghe

**GET** `/listening-lessons/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Listening Lesson",
    "audioUrl": "https://example.com/audio.mp3",
    "transcript": "The conversation transcript...",
    "viTranslation": "Ban dich tieng Viet...",
    "status": "private",
    "createdBy": "user-uuid",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "questions": [
      {
        "id": "question-uuid",
        "lessonId": "lesson-uuid",
        "question": "What is the speaker ordering?",
        "optionA": "Pizza",
        "optionB": "Pasta",
        "optionC": "Salad",
        "optionD": "Soup",
        "correctAnswer": "A",
        "explain": "...",
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ]
  },
  "message": "Lay chi tiet bai luyen nghe thanh cong"
}
```

---

### 10.6 Cap nhat bai luyen nghe

**PATCH** `/listening-lessons/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "audioUrl": "https://new-url.com/audio.mp3",
  "transcript": "Updated transcript...",
  "viTranslation": "Updated translation..."
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Cap nhat bai luyen nghe thanh cong"
}
```

---

### 10.7 Xoa bai luyen nghe (xoa mem)

**DELETE** `/listening-lessons/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Xoa bai luyen nghe thanh cong"
}
```

---

### 10.8 Yeu cau public bai luyen nghe

**POST** `/listening-lessons/:id/request-public`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Yeu cau public bai luyen nghe thanh cong"
}
```

---

### 10.9 Chuyen bai luyen nghe ve che do rieng tu

**POST** `/listening-lessons/:id/make-private`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Chuyen bai luyen nghe thanh private thanh cong"
}
```

---

## 11. Listening Questions

Co 2 nhom route:

- **Nested:** `/listening-lessons/:lessonId/questions`
- **Standalone:** `/listening-questions`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 11.1 Tao cau hoi cho bai luyen nghe

**POST** `/listening-lessons/:lessonId/questions`

Giong nhu Reading Questions (muc 8.1).

**Request Body:**
```json
{
  "question": "What is the speaker talking about?",
  "option_a": "Pizza",
  "option_b": "Pasta",
  "option_c": "Salad",
  "option_d": "Soup",
  "correct_answer": "A",
  "explain": "..."
}
```

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "id": "question-uuid",
    "lessonId": "lesson-uuid",
    "question": "What is the speaker talking about?",
    "optionA": "Pizza",
    "optionB": "Pasta",
    "optionC": "Salad",
    "optionD": "Soup",
    "correctAnswer": "A",
    "explain": "...",
    "createdAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Tao cau hoi thanh cong"
}
```

---

### 11.2 Tao nhieu cau hoi

**POST** `/listening-lessons/:lessonId/questions/bulk`

Giong nhu Reading Questions (muc 8.2).

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": [ ... ],
  "message": "Tao nhieu cau hoi thanh cong"
}
```

---

### 11.3 Lay danh sach cau hoi cua bai luyen nghe

**GET** `/listening-lessons/:lessonId/questions`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": [ ... ],
  "message": "Lay danh sach cau hoi thanh cong"
}
```

---

### 11.4 Cap nhat cau hoi

**PATCH** `/listening-questions/:id`

Giong nhu Reading Questions (muc 8.4).

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Cap nhat cau hoi thanh cong"
}
```

---

### 11.5 Xoa mot cau hoi

**DELETE** `/listening-questions/:id`

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": { ... },
  "message": "Xoa cau hoi thanh cong"
}
```

---

### 11.6 Xoa nhieu cau hoi

**DELETE** `/listening-questions/bulk`

**Request Body:**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "deletedCount": 3
  },
  "message": "Xoa cau hoi thanh cong"
}
```

---

## 12. Listening Practice

Base path: `/listening-lessons`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 12.1 Nop bai luyen nghe

**POST** `/listening-lessons/:lessonId/practice/submit`

Giong nhu Reading Practice (muc 9.1).

**Request Body:**
```json
{
  "answers": [
    { "questionId": "uuid-1", "answer": "A" },
    { "questionId": "uuid-2", "answer": "B" }
  ]
}
```

**Response (201):**
```json
{
  "code": 201,
  "success": true,
  "data": {
    "practiceId": "uuid",
    "score": 50,
    "totalQuestions": 2,
    "correctCount": 1,
    "wrongCount": 1,
    "results": [ ... ],
    "completedAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Nop bai luyen nghe thanh cong"
}
```

---

### 12.2 Lay lich su luyen nghe

**GET** `/listening-lessons/practice/history`

Giong nhu Reading Practice (muc 9.2).

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "score": 80,
        "completedAt": "2026-05-10T00:00:00.000Z",
        "lessonTitle": "Restaurant Conversation",
        "lessonId": "lesson-uuid"
      }
    ],
    "pagination": { ... }
  },
  "message": "Lay lich su luyen nghe thanh cong"
}
```

---

### 12.3 Chi tiet bai luyen nghe da lam

**GET** `/listening-lessons/practice/:practiceId`

Giong nhu Reading Practice (muc 9.3).

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "practiceId": "uuid",
    "score": 80,
    "totalQuestions": 5,
    "correctCount": 4,
    "wrongCount": 1,
    "lesson": {
      "id": "lesson-uuid",
      "title": "Restaurant Conversation",
      "audioUrl": "https://...",
      "transcript": "...",
      "viTranslation": "..."
    },
    "questions": [ ... ],
    "completedAt": "2026-05-10T00:00:00.000Z"
  },
  "message": "Lay chi tiet bai luyen nghe thanh cong"
}
```

---

## 13. Moderation Requests

Base path: `/moderation-requests`

Tat ca endpoint deu yeu cau: `Authorization: Bearer <accessToken>`

### 13.1 Tao yeu cau kiem duyet

**POST** `/moderation-requests`

Gui yeu cau kiem duyet noi dung (bo tu vung, bai luyen doc, bai luyen nghe) de admin duyet public.

**Request Body:**
```json
{
  "contentType": "vocabulary_set",
  "contentId": "uuid-cua-bo-tu-vung"
}
```

| Truong | Kieu | Bat buoc | Mo ta |
|--------|------|----------|-------|
| contentType | string | Co | Loai noi dung: `vocabulary_set`, `reading_lesson`, `listening_lesson` |
| contentId | string | Co | UUID cua noi dung |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "request-uuid",
    "contentType": "vocabulary_set",
    "contentId": "uuid-cua-bo-tu-vung",
    "status": "pending",
    "requestedBy": "user-uuid",
    "reviewedBy": null,
    "reviewedAt": null,
    "createdAt": "2026-05-10T00:00:00.000Z",
    "content": {
      "id": "uuid-cua-bo-tu-vung",
      "title": "Travel Vocabulary",
      "description": "Tu vung du lich"
    }
  },
  "message": "Yeu cau kiem duyet da duoc gui thanh cong"
}
```

---

### 13.2 Danh sach yeu cau kiem duyet cua toi

**GET** `/moderation-requests/my`

**Query Parameters:**
| Param | Kieu | Mac dinh | Mo ta |
|-------|------|----------|-------|
| page | number | 1 | So trang |
| limit | number | 15 | So item moi trang |
| keyword | string | "" | Tu khoa tim kiem |
| status | string | "" | Loc theo trang thai: `pending`, `approved`, `rejected` |
| sortField | string | "" | Truong sap xep |
| sortOrder | string | "" | Thu tu |

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "data": [
      {
        "id": "request-uuid",
        "contentType": "vocabulary_set",
        "contentId": "uuid",
        "status": "pending",
        "requestedBy": "user-uuid",
        "reviewedBy": null,
        "reviewedAt": null,
        "createdAt": "2026-05-10T00:00:00.000Z",
        "content": {
          "id": "uuid",
          "title": "Travel Vocabulary",
          "description": "Tu vung du lich"
        }
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 15
  },
  "message": "Lay danh sach yeu cau kiem duyet thanh cong"
}
```

---

## 14. Learning Stats

Base path: `/learning-stats`

### 14.1 Lay thong ke hoc tap

**GET** `/learning-stats`

Yeu cau: `Authorization: Bearer <accessToken>`

Tra ve thong ke hoc tap tong hop cua user bao gom vocabulary, reading, va listening.

**Response (200):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "vocabulary": {
      "ownedCount": 5,
      "practicedCount": 3,
      "practiceCount": 25,
      "avgScore": 78
    },
    "reading": {
      "ownedCount": 3,
      "practicedCount": 2,
      "practiceCount": 10,
      "avgScore": 85
    },
    "listening": {
      "ownedCount": 2,
      "practicedCount": 1,
      "practiceCount": 5,
      "avgScore": 60
    }
  },
  "message": "Lay thong ke hoc tap thanh cong"
}
```

| Truong | Mo ta |
|--------|-------|
| ownedCount | So luong tai nguyen da tao |
| practicedCount | So luong tai nguyen da luyen tap |
| practiceCount | Tong so lan luyen tap |
| avgScore | Diem trung binh (%) |

---

## Phu Luc

### Cac trang thai (Status)

| Gia tri | Mo ta |
|---------|-------|
| `private` | Noi dung chi nguoi tao nhin thay |
| `req_public` | Dang cho admin duyet de public |
| `public` | Moi nguoi deu nhin thay |

### Cac loai bai tap tu vung

| Gia tri | Mo ta |
|---------|-------|
| `quiz` | Cau hoi tra nghia (EN -> VN) |
| `listening_quiz` | Nghe va tra nghia |
| `translate_write` | Dich cau tieng Viet ra tieng Anh |
| `listen_write` | Nghe va viet tu tieng Anh |

### Cac loai noi dung kiem duyet

| Gia tri | Mo ta |
|---------|-------|
| `vocabulary_set` | Bo tu vung |
| `reading_lesson` | Bai luyen doc |
| `listening_lesson` | Bai luyen nghe |

### Cac trang thai kiem duyet

| Gia tri | Mo ta |
|---------|-------|
| `pending` | Dang cho xu ly |
| `approved` | Da duyet |
| `rejected` | Tu choi |
