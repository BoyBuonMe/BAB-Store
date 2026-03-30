const authConfig = require("@/config/auth");
const transporter = require("@/config/nodemailer");
const jwt = require("jsonwebtoken");

const emailService = {
    sendVerifyEmail: async (newUser) => {
    const verifyToken = jwt.sign(
      {
        sub: newUser.id,
        exp: Date.now() + 2 * 60 * 60 * 1000,
      },
      authConfig.verifyEmailSecret,
    );
    const info = await transporter.sendMail({
      from: '"F8" <huynhquangnam3105@gmail.com>',
      to: newUser.email,
      subject: newUser.subject || "Verify Email",
      html: `<p><a href="http://localhost:5173/#/verify-email?token=${verifyToken}">Click to verify email</a></p>`,
    });
    return info;
  },
}

module.exports = emailService;