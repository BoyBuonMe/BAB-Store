const express = require("express");

const authController = require("@/controllers/auth.controller");
const authRequired = require("@/middlewares/authRequired");
const adminRequired = require("@/middlewares/adminRequired");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);

router.get("/me", authRequired, authController.getCurrentUser);
module.exports = router;