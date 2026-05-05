const bcrypt = require("bcrypt");
const crypto = require("crypto");
const otpModel = require("../repositories/otp.model");
const authModel = require("../repositories/auth.model");
const { sendMail } = require("../../../utils/sendMail");
const { AppError } = require("../../../utils/appError");
const env = require("../../../config/env.config");

const SALT_ROUNDS = 10;

/**
 * Sinh mã OTP ngẫu nhiên (số, 6 chữ số mặc định).
 * @returns {string}
 */
const generateOtp = (length = env.otpLength) => {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, "0");
};

/**
 * Luồng 1: User gửi email → Backend sinh OTP → Hash & lưu DB → Gửi email cho user.
 *
 * @param {string} email
 * @returns {Promise<void>}
 */
const requestOtp = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const userExists = await authModel.findUserByEmail(normalizedEmail);
  if (!userExists) {
    throw new AppError("Email không tồn tại trong hệ thống", 404);
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);

  await otpModel.saveOtp({
    email: normalizedEmail,
    hashedOtp,
    expiresAt,
  });

  const subject = "Mã OTP để đặt lại mật khẩu";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
      <p style="color: #555; font-size: 16px;">Xin chào,</p>
      <p style="color: #555; font-size: 16px;">
        Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        Dưới đây là mã OTP của bạn: <strong>${otp}</strong>
      </p>
      <p style="color: #555; font-size: 14px;">
        Mã này sẽ hết hạn sau <strong>${env.otpExpiresInMinutes} phút</strong>.
      </p>
      <p style="color: #555; font-size: 14px;">
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      </p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">
        Email được gửi tự động bởi English Learning AI. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  try {
    await sendMail(normalizedEmail, subject, html);
    console.log("Email OTP sent successfully to", normalizedEmail);
  } catch (emailError) {
    console.error("Email send FAILED:", emailError.message);
    throw new AppError("Không thể gửi email OTP", 500);
  }
};

/**
 * Luồng 2: User gửi email + otp + newPassword → Backend verify OTP → Update password.
 *
 * @param {{ email: string, otp: string, newPassword: string }} payload
 * @returns {Promise<void>}
 */
const resetPassword = async ({ email, otp, newPassword }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await otpModel.findValidOtp(normalizedEmail);

  if (!otpRecord) {
    throw new AppError("Mã OTP không hợp lệ hoặc đã hết hạn", 400);
  }

  const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

  if (!isOtpValid) {
    throw new AppError("Mã OTP không chính xác", 400);
  }

  await authModel.updateUserPassword(normalizedEmail, newPassword);

  // Xóa luôn OTP sau khi đổi mật khẩu thành công
  await otpModel.deleteOtp(otpRecord.id);
};

module.exports = {
  generateOtp,
  requestOtp,
  resetPassword,
};
