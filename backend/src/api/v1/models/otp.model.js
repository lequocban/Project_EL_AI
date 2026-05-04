const { createAdminClient } = require("../../../config/supabase");

/**
 * Lưu OTP mới cho email (xóa OTP cũ trước khi tạo mới).
 * @param {string} email
 * @param {string} hashedOtp  - OTP đã được hash bằng bcrypt
 * @param {Date}   expiresAt
 * @returns {Promise<void>}
 */
const saveOtp = async ({ email, hashedOtp, expiresAt }) => {
  const adminClient = createAdminClient();

  await adminClient
    .from("password_otps")
    .delete()
    .eq("email", email.toLowerCase().trim());

  const { error } = await adminClient.from("password_otps").insert({
    email: email.toLowerCase().trim(),
    otp_hash: hashedOtp,
    expires_at: expiresAt.toISOString(),
    used: false,
  });

  if (error) {
    throw new Error("Không thể lưu OTP: " + error.message);
  }
};

/**
 * Tìm OTP hợp lệ (chưa dùng, chưa hết hạn) theo email.
 * @param {string} email
 * @returns {Promise<Object|null>} row hoặc null
 */
const findValidOtp = async (email) => {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("password_otps")
    .select("id, email, otp_hash, expires_at, used")
    .eq("email", email.toLowerCase().trim())
    .eq("used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error("Lỗi truy vấn OTP: " + error.message);
  }

  return data || null;
};

/**
 * Đánh dấu OTP đã được sử dụng.
 * @param {number} otpId
 * @returns {Promise<void>}
 */
const markOtpAsUsed = async (otpId) => {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("password_otps")
    .update({ used: true })
    .eq("id", otpId);

  if (error) {
    throw new Error("Không thể cập nhật OTP: " + error.message);
  }
};

/**
 * Xóa OTP sau khi đã sử dụng thành công.
 * @param {number} otpId
 * @returns {Promise<void>}
 */
const deleteOtp = async (otpId) => {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("password_otps")
    .delete()
    .eq("id", otpId);

  if (error) {
    throw new Error("Không thể xóa OTP: " + error.message);
  }
};

module.exports = {
  saveOtp,
  findValidOtp,
  markOtpAsUsed,
  deleteOtp,
};
