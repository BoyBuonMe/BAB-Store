// const jwt = require("jsonwebtoken");
// const authConfig = require("@/config/auth");
// const authService = require("@/services/auth.service");

async function adminRequired(req, res, next) {
  //   const accessToken = req.headers?.authorization?.replace("Bearer", "")?.trim();

  //   if (!accessToken) return res.unauthorized();

  //   const payload = jwt.verify(accessToken, authConfig.jwtSecret);

  //   if (payload.exp < Date.now() / 1000) {
  //     return res.unauthorized();
  //   }

  //   const userId = payload.sub;
  //   const user = await authService.getUserById(userId);

  if (req.auth.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "You are not an admin.",
    });
  }

  next();
}

module.exports = adminRequired;
