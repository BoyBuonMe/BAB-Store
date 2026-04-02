require("dotenv").config();
const crypto = require("crypto");

const orderService = require("@/services/order.service");

// Lưu tạm đơn chờ thanh toán (demo). Nên thay bằng Redis/DB trong production.
const PENDING_TTL_MS = 30 * 60 * 1000;
const pendingOrders = new Map(); // key: orderId, value: { userId, orderPayload, expiresAt }

function getEnv(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === null || String(v).trim() === "") return fallback;
  // strip quotes if user put MOMO_X="..."
  return String(v).replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  const s = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return fallback;
}

function generateId(prefix) {
  const now = Date.now();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${now}${rand}`;
}

function encodeExtraData(data) {
  const json = JSON.stringify(data ?? {});
  return Buffer.from(json, "utf8").toString("base64");
}

function decodeExtraData(extraData) {
  if (!extraData) return null;
  try {
    const json = Buffer.from(String(extraData), "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of pendingOrders.entries()) {
    if (!value?.expiresAt || value.expiresAt <= now) pendingOrders.delete(key);
  }
}

const momoService = {
  createPayment: async ({ userId, amount, orderPayload }) => {
    cleanupExpired();

    const accessKey = getEnv("MOMO_ACCESS_KEY", "");
    const secretKey = getEnv("MOMO_SECRET_KEY", "");
    const partnerCode = getEnv("MOMO_PARTNER_CODE", "");
    const momoBaseUrl = getEnv("MOMO_BASE_URL", "https://test-payment.momo.vn/v2/gateway/api");
    const redirectUrl = getEnv("MOMO_REDIRECT_URL", "");
    const ipnUrl = getEnv("MOMO_IPN_URL", "");
    const requestType = getEnv("MOMO_REQUEST_TYPE", "payWithMethod");
    const autoCapture = parseBoolean(getEnv("MOMO_AUTO_CAPTURE", "true"), true);
    const lang = getEnv("MOMO_LANG", "vi");
    const storeId = getEnv("MOMO_STORE_ID", "MoMoTest");

    if (!accessKey || !secretKey || !partnerCode) {
      throw new Error("Thiếu cấu hình MoMo (MOMO_ACCESS_KEY/MOMO_SECRET_KEY/MOMO_PARTNER_CODE)");
    }

    if (!redirectUrl) throw new Error("Thiếu MOMO_REDIRECT_URL");
    if (!ipnUrl) throw new Error("Thiếu MOMO_IPN_URL");

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error("amount không hợp lệ");
    }

    // MoMo test yêu cầu amount là số nguyên (VND)
    const momoAmount = Math.round(Number(amount)).toString();

    const orderId = generateId("MM");
    const requestId = orderId;
    const orderInfo = `Thanh toán MoMo - ${orderId}`;

    // Lưu tạm toàn bộ payload để IPN tạo Order (theo yêu cầu bài)
    if (orderPayload) {
      if (!userId) throw new Error("Thiếu userId (auth) để tạo đơn MoMo");
      pendingOrders.set(orderId, {
        userId,
        orderPayload,
        expiresAt: Date.now() + PENDING_TTL_MS,
      });
    }

    const extraData = encodeExtraData({
      orderId,
      // có thể nhét addressLine vào đây nếu muốn
      addressLine: orderPayload?.shippingAddress?.addressLine ?? null,
    });

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${momoAmount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const body = {
      partnerCode,
      partnerName: "MoMo",
      storeId,
      requestId,
      amount: momoAmount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      signature,
    };

    const endpoint = `${String(momoBaseUrl).replace(/\/$/, "")}/create`;
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data?.message || "MoMo create payment failed");
    }

    if (!data?.payUrl) {
      throw new Error(data?.message || "Không nhận được payUrl từ MoMo");
    }

    return {
      payUrl: data.payUrl,
      orderId,
      requestId,
    };
  },

  verifyIpnSignature: (ipnBody) => {
    const accessKey = getEnv("MOMO_ACCESS_KEY", "");
    const secretKey = getEnv("MOMO_SECRET_KEY", "");

    const signature = ipnBody?.signature;
    if (!signature) return false;
    if (!accessKey || !secretKey) return false;

    // Format theo docs MoMo: key=value&key=value... (sắp xếp theo yêu cầu của từng API)
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${ipnBody?.amount ?? ""}` +
      `&extraData=${ipnBody?.extraData ?? ""}` +
      `&message=${ipnBody?.message ?? ""}` +
      `&orderId=${ipnBody?.orderId ?? ""}` +
      `&orderInfo=${ipnBody?.orderInfo ?? ""}` +
      `&orderType=${ipnBody?.orderType ?? ""}` +
      `&partnerCode=${ipnBody?.partnerCode ?? ""}` +
      `&payType=${ipnBody?.payType ?? ""}` +
      `&requestId=${ipnBody?.requestId ?? ""}` +
      `&responseTime=${ipnBody?.responseTime ?? ""}` +
      `&resultCode=${ipnBody?.resultCode ?? ""}` +
      `&transId=${ipnBody?.transId ?? ""}`;

    const expected = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
    return String(signature).toLowerCase() === expected.toLowerCase();
  },

  handleIpn: async (ipnBody) => {
    cleanupExpired();

    // Verify chữ ký để tránh callback giả
    if (!momoService.verifyIpnSignature(ipnBody)) return;

    const resultCode = Number(ipnBody?.resultCode);
    if (resultCode !== 0) return;

    const orderId = ipnBody?.orderId;
    if (!orderId) return;

    const extra = decodeExtraData(ipnBody?.extraData);
    const pending = pendingOrders.get(orderId);
    if (!pending) return;

    const { userId, orderPayload } = pending;

    // Dùng lại luồng tạo order sẵn có để đảm bảo validate + trừ tồn kho
    const payload = {
      ...orderPayload,
      paymentMethod: "momo",
      status: "DELIVERED", // theo yêu cầu
      shippingAddress: {
        ...(orderPayload?.shippingAddress || {}),
        addressLine: (extra?.addressLine || "momo").toString(),
      },
    };

    await orderService.createOrderService(userId, payload);

    // tránh double-create khi MoMo retry IPN
    pendingOrders.delete(orderId);
  },
};

module.exports = momoService;

