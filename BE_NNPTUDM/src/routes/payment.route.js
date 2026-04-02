const express = require("express");
const authRequired = require("@/middlewares/authRequired");
const momoController = require("@/controllers/momo.controller");

const router = express.Router();

// FE -> BE: tạo link thanh toán
router.post("/momo/create", authRequired, momoController.createMomoPaymentController);

// MoMo -> BE: IPN callback
router.post("/momo/ipn", momoController.momoIpnController);

module.exports = router;

