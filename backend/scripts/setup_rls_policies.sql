-- ============================================
-- RLS Policies for English Learning AI App
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- Table: words
-- ============================================

-- Bật RLS cho bảng words (nếu chưa bật)
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Xóa policies cũ nếu tồn tại
DROP POLICY IF EXISTS "Allow authenticated users to read words" ON words;
DROP POLICY IF EXISTS "Allow authenticated users to insert words" ON words;
DROP POLICY IF EXISTS "Allow authenticated users to update words" ON words;
DROP POLICY IF EXISTS "Allow authenticated users to delete words" ON words;

-- Policy cho phép user đã xác thực đọc tất cả các từ vựng
CREATE POLICY "Allow authenticated users to read words"
ON words
FOR SELECT
TO authenticated
USING (true);

-- Policy cho phép user đã xác thực tạo từ vựng mới
CREATE POLICY "Allow authenticated users to insert words"
ON words
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy cho phép user đã xác thực cập nhật từ vựng
CREATE POLICY "Allow authenticated users to update words"
ON words
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy cho phép user đã xác thực xóa từ vựng
CREATE POLICY "Allow authenticated users to delete words"
ON words
FOR DELETE
TO authenticated
USING (true);


-- ============================================
-- Table: vocabulary_sets
-- ============================================

-- Bật RLS cho bảng vocabulary_sets (nếu chưa bật)
ALTER TABLE vocabulary_sets ENABLE ROW LEVEL SECURITY;

-- Xóa policies cũ nếu tồn tại
DROP POLICY IF EXISTS "Allow authenticated users to read vocabulary_sets" ON vocabulary_sets;
DROP POLICY IF EXISTS "Allow authenticated users to insert vocabulary_sets" ON vocabulary_sets;
DROP POLICY IF EXISTS "Allow authenticated users to update vocabulary_sets" ON vocabulary_sets;
DROP POLICY IF EXISTS "Allow authenticated users to delete vocabulary_sets" ON vocabulary_sets;

-- Policy cho phép user đã xác thực đọc vocabulary_sets
CREATE POLICY "Allow authenticated users to read vocabulary_sets"
ON vocabulary_sets
FOR SELECT
TO authenticated
USING (true);

-- Policy cho phép user đã xác thực tạo vocabulary_sets mới
CREATE POLICY "Allow authenticated users to insert vocabulary_sets"
ON vocabulary_sets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy cho phép user đã xác thực cập nhật vocabulary_sets (dùng cho soft delete)
CREATE POLICY "Allow authenticated users to update vocabulary_sets"
ON vocabulary_sets
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy cho phép user đã xác thực xóa vocabulary_sets
CREATE POLICY "Allow authenticated users to delete vocabulary_sets"
ON vocabulary_sets
FOR DELETE
TO authenticated
USING (true);


-- ============================================
-- Table: profiles
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON profiles;

CREATE POLICY "Allow authenticated users to read profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
