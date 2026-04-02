const cron = require("node-cron");
const { publishNextPost } = require("@/services/post.service");

function startPublishSchedule() {
  // Chạy mỗi 4 tiếng: 0h, 4h, 8h, 12h, 16h, 20h
  cron.schedule("*/15 * * * *", async () => {
    console.log(`🕐 [${new Date().toLocaleString("vi-VN")}] Chạy schedule publish post...`);
    await publishNextPost();
  });

  console.log("📅 Schedule publish post đã được đăng ký (mỗi 4 tiếng).");
}

module.exports = { startPublishSchedule };