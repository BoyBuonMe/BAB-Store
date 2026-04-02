const postService = require("@/services/post.service");

/**
 * Gọi từ node-cron: sinh 1 bài blog từ ý tưởng pending đầu tiên (nếu có).
 */
async function weeklyBlogJob() {
  try {
    const result = await postService.generateSinglePostFromNextPendingIdea();
    if (result) {
      console.log("[weeklyBlog] Đã tạo bài blog mới, id:", result.id);
    } else {
      console.log("[weeklyBlog] Không có postIdea pending — bỏ qua.");
    }
  } catch (error) {
    console.error("[weeklyBlog] Lỗi:", error?.message || error);
  }
}

module.exports = weeklyBlogJob;
