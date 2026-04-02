require("dotenv").config();
require("module-alias/register");
require("./polyfill");

// const cron = require("node-cron");
// const weeklyBlogJob = require("@/tasks/weeklyBlog");
const { startPublishSchedule } = require("@/schedules/publishPost.schedule");

const express = require("express");
const cors = require("cors");

const rootRouter = require("@/routes");
const customResponse = require("@/middlewares/customResponse");
const errorHandle = require("@/middlewares/errorHandle");
const notFoundHandle = require("@/middlewares/notFoundHandle");

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(customResponse);
app.use(express.static("public"));

// Router
app.use("/api", rootRouter);

// Error handle
app.use(notFoundHandle);
app.use(errorHandle);

app.listen(port, () => {
  console.log(`Demo app listening on port ${port}`);

  startPublishSchedule();

  // Mỗi tuần (thứ Hai 9:00 giờ VN): sinh 1 bài blog nước hoa nếu còn ý tưởng pending
  // if (process.env.ENABLE_WEEKLY_BLOG_CRON !== "false") {
  //   cron.schedule(
  //     "0 9 * * 1",
  //     () => {
  //       weeklyBlogJob();
  //     },
  //     { timezone: "Asia/Ho_Chi_Minh" },
  //   );
  //   console.log("[cron] Weekly blog job scheduled: Monday 09:00 Asia/Ho_Chi_Minh");
  // }
});
