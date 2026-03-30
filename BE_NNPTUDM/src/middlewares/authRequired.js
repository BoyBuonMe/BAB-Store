const jwt = require("jsonwebtoken");

const authConfig = require("@/config/auth");
const authService = require("@/services/auth.service");

async function authRequired(req, res, next) {
  const accessToken = req.headers?.authorization?.replace("Bearer", "")?.trim();

  if (!accessToken) return res.unauthorized();

  const payload = jwt.verify(accessToken, authConfig.jwtSecret);

  // Check expires
  if (payload.exp < Date.now() / 1000) {
    return res.unauthorized();
  }

  const userId = payload.sub;
  const user = await authService.getUserById(userId);
  if (!user) return res.unauthorized();

  req.auth = {
    user,
  };

  next();
}

module.exports = authRequired;
