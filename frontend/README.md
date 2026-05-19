# English Up - Ứng dụng học Tiếng Anh

## Giới thiệu

English Up là ứng dụng web học tiếng Anh toàn diện với các module:
- **Vocabulary**: Học từ vựng theo chủ đề
- **Grammar**: Ngữ pháp tiếng Anh
- **Listening**: Luyện nghe
- **Reading**: Đọc hiểu
- **TOEIC**: Luyện thi TOEIC
- **Leaderboard**: Bảng xếp hạng người học

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env.local` với các biến môi trường:
```
VITE_APP_BASE_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Chạy ứng dụng

- **Development**: `npm run dev` (chạy tại `http://localhost:5173`)
- **Build**: `npm run build`
- **Preview build**: `npm run preview`

## Công nghệ sử dụng

- React 18
- Vite 6
- TanStack Query
- React Router v6
- Tailwind CSS
- Supabase
- Cloudinary
