const authService = require("@/services/auth.service");
const queueService = require("@/services/queue.service");

const register = async (req, res) => {
  const data = req.body;
  const userAgent = req.headers["user-agent"];
  const userTokens = await authService.handleRegister(data, userAgent);

  // await emailService.sendVerifyEmail(userTokens.user);
  queueService.push({
    type: "sendVerificationEmail",
    payload: {
      ...userTokens.user,
      subject: "Verify Email",
    },
  });

  res.success(userTokens);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers["user-agent"];
  const [error, userTokens] = await authService.handleLogin(email, password, userAgent);
  if (error) return res.unauthorized();

  res.success(userTokens);
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken || null;

    const result = await authService.handleLogout(refreshToken);

    return res.success(result);
  } catch (error) {
    return res.error({
      success: false,
      message: "Lỗi server khi đăng xuất",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  const userAgent = req.headers["user-agent"];
  const [error, data] = await authService.handleRefreshToken(req.body.refreshToken, userAgent);

  if (error) return res.unauthorized();

  res.success(data);
};

const getCurrentUser = async (req, res) => {
  res.success(req.auth.user);
};

module.exports = { login, register, logout, refreshToken, getCurrentUser };
