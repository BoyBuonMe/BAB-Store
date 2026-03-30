const authConfig = {
  jwtSecret: process.env.AUTH_JWT_SECRET,
  accessTokenTTL: +process.env.AUTH_ACCESS_TOKEN_TTL || 3600,
  refreshTokenTTL: +process.env.AUTH_REFRESH_TOKEN_TTL || 7,
  verifyEmailSecret: process.env.JWT_VERIFY_EMAIL_SECRET,
};

module.exports = authConfig;
