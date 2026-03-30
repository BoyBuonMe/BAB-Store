const emailService = require("@/services/email.service")

const sendVerificationEmail = async (payload) => {
    await emailService.sendVerifyEmail(payload);
}

module.exports = sendVerificationEmail;