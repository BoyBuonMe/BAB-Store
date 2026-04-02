const momoService = require("@/services/momo.service");

async function createMomoPaymentController(req, res) {
  try {
    const userId = req.auth?.user?.id;
    const { amount, orderPayload } = req.body || {};

    const result = await momoService.createPayment({ userId, amount, orderPayload });

    return res.success({
      message: "Tạo link thanh toán MoMo thành công",
      data: result,
    });
  } catch (error) {
    console.error("createMomoPaymentController error:", error);
    return res.error({
      message: error.message || "Tạo link thanh toán MoMo thất bại",
    });
  }
}

async function momoIpnController(req, res) {
  try {
    // MoMo khuyến nghị trả 204 (No Content) trong 15s
    await momoService.handleIpn(req.body);
    return res.status(204).end();
  } catch (error) {
    console.error("momoIpnController error:", error);
    // vẫn trả 204 để MoMo không retry liên tục (môi trường test)
    return res.status(204).end();
  }
}

module.exports = { createMomoPaymentController, momoIpnController };

