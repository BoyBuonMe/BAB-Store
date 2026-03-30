const emailService = require("@/services/email.service")

const sendPasswordChangeEmail = async (payload) => {
    await emailService.sendVerifyEmail(payload);
}

module.exports = sendPasswordChangeEmail;