const appConfig = require("@/config/app");

const fullUrl = (path) => {
  const base = (appConfig.baseUrl || "http://localhost:3001").replace(/\/$/, "");
  const p = String(path || "").replace(/\\/g, "/").replace(/^\//, "");
  return `${base}/${p}`;
};

module.exports = { fullUrl };
