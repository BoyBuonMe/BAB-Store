require("dotenv").config();
require("module-alias/register");
const tasks = require("@/tasks");

// require("@/config/database");
// const emailService = require("@/services/email.service");
const queueService = require("@/services/queue.service");
const wait = require("@/utils/wait");
// const parsePayload = require("@/utils/parsePayload");

(async () => {
  while (true) {
    const pendingJob = await queueService.getOnePending();

    if (pendingJob) {
      const type = pendingJob.type;
      const payload = JSON.parse(pendingJob.payload);

      try {
        // Inprogress (Đang xử lý)
        await queueService.updateStatusJob(pendingJob.id, "inprogress");
        // await emailService.sendVerifyEmail(payload);
        const handler = tasks[type];

        if (!handler) throw new Error("Error");
        await handler(payload);

        //   Completed (Thành công)
        await queueService.updateStatusJob(pendingJob.id, "completed");
      } catch (error) {
        await queueService.updateStatusJob(pendingJob.id, "failed");
      }
    }

    await wait(1000);
  }
})();
