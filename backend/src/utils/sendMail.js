const env = require("../config/env.config");
const nodemailer = require("nodemailer");

module.exports.sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });

  const mailOptions = {
    from: `"English Learning AI" <${env.emailUser}>`,
    to,
    subject,
    html,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Email send error:", error.message);
    throw error;
  }
};
