import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// FIX __dirname cho ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API base
const BASE_URL = "https://provinces.open-api.vn/api/v2";

// đường dẫn file output
const provincesPath = path.join(
  __dirname,
  "..",
  "src",
  "mocks",
  "provinces.json",
);
const wardsPath = path.join(
  __dirname,
  "..",
  "src",
  "mocks",
  "wards-by-city.json",
);

// hàm fetch
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Fetch lỗi: " + url);
  }
  return res.json();
}

async function run() {
  try {
    console.log("🚀 Bắt đầu lấy dữ liệu...");

    // 1. Lấy provinces
    console.log("📍 Đang lấy provinces...");
    const provinces = await fetchJson(`${BASE_URL}/p/`);

    fs.writeFileSync(provincesPath, JSON.stringify(provinces, null, 2));
    console.log("✅ Đã ghi provinces.json");

    // 2. Lấy wards theo từng tỉnh
    const wardsByCity = {};

    for (const province of provinces) {
      const code = province.code;
      console.log(`📦 Đang lấy wards của: ${province.name}`);

      const data = await fetchJson(`${BASE_URL}/p/${code}?depth=2`);

      wardsByCity[String(code)] = Array.isArray(data.wards) ? data.wards : [];
    }

    fs.writeFileSync(wardsPath, JSON.stringify(wardsByCity, null, 2));
    console.log("✅ Đã ghi wards-by-city.json");

    console.log("🎉 Hoàn tất!");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  }
}

run();
