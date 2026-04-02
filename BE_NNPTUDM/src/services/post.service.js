const prisma = require("@/libs/prisma");

async function getPosts({ page = 1, limit = 9 } = {}) {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        slug: true,
        minRead: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.post.count({
      where: { publishedAt: { not: null } },
    }),
  ]);

  return {
    posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      content: true,
      slug: true,
      minRead: true,
      publishedAt: true,
      createdAt: true,
    },
  });
}

// Hàm publish: lấy 1 post có publishedAt = null rồi set publishedAt = now
async function publishNextPost() {
  const post = await prisma.post.findFirst({
    where: { publishedAt: null },
    orderBy: { createdAt: "asc" },
  });

  if (!post) {
    console.log("📭 Không còn post nào chưa publish.");
    return null;
  }

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { publishedAt: new Date() },
  });

  console.log(`✅ Đã publish: "${updated.title}" lúc ${updated.publishedAt}`);
  return updated;
}

module.exports = { getPosts, getPostById, publishNextPost };

// const { Output } = require("ai");
// const { z } = require("zod");
// const readingTime = require("reading-time");

// const prisma = require("@/libs/prisma");
// const aiService = require("@/services/ai.service");
// const slugify = require("@/utils/slugify");

// function serializeBigInt(data) {
//   return JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));
// }

// function buildPerfumeBlogPrompt(idea) {
//   return `
//     Bạn hãy viết một bài blog chuyên sâu về nước hoa và mùi hương dành cho độc giả Việt Nam. Bài viết phải tuân thủ nghiêm ngặt các tiêu chí sau:

//     Thông tin đầu vào:
//       - Chủ đề bài viết (Title): ${idea.title}
//       - Mục tiêu và phạm vi (Description): ${idea.description}

//     Cấu trúc và yêu cầu bài viết:

//       Tiêu đề và mở đầu:
//         - Tạo title/hook hấp dẫn từ title đã cho. Tuyệt đối không dùng Title Case kiểu tiếng Anh cho mọi chữ. Chỉ viết hoa chữ cái đầu câu và danh từ riêng nếu có.
//         - Viết một đoạn mở bài khoảng 200-300 từ. Giới thiệu chủ đề một cách thân thiện, giải thích tại sao nó quan trọng với người yêu nước hoa, và mô tả ngắn gọn những gì độc giả sẽ học được.

//       Nội dung chính:
//         - Nội dung khoảng 800 - 1000 từ, chia thành 4 đến 5 phần lớn với các tiêu đề con (dùng heading H2, H3). Cấu trúc đi từ khái niệm cơ bản (ví dụ: hương đầu/giữa/cuối, độ lưu hương, độ tỏa), đến gợi ý chọn nước hoa theo mùa/phong cách/dịp sử dụng, rồi mẹo thực tế (bảo quản, xịt đúng cách, layering nhẹ nhàng nếu phù hợp).
//         - Văn phong: Dùng ngôi "mình" hoặc "tôi" (đồng nhất trong cả bài), gần gũi, tôn trọng độc giả. Tránh biệt ngữ quá hàn lâm nếu không giải thích.
//         - Với mỗi khái niệm quan trọng: (a) Định nghĩa đơn giản bằng tiếng Việt, (b) Một ví dụ so sánh từ đời thường, (c) Gợi ý áp dụng thực tế (ví dụ chọn mùi cho ngày nóng, buổi tối, văn phòng).
//         - Không bắt buộc có đoạn code. Nếu nhắc đến thành phần hương, hãy mô tả bằng ngôn ngữ dễ hiểu.

//       Kết bài:
//         - Tóm tắt ngắn gọn 3-5 điểm chính.
//         - Đề xuất một hành động nhỏ độc giả có thể làm ngay (ví dụ: thử một nhóm hương mới, ghi nhật ký mùi, v.v.).

//       Quy tắc bắt buộc về hình thức:
//         - Tránh lạm dụng thuật ngữ tiếng Anh không giải thích
//         - Tuyệt đối không sử dụng emoji hay ký tự trang trí (như ⭐, ✅, 🚀, ---).
//         - Thay "->" thay vì mũi tên đặc biệt nếu cần
//         - Chỉ dùng định dạng markdown cơ bản: in đậm, in nghiêng, danh sách, heading.
//         - Cố ý tạo lỗi đánh máy ngẫu nhiên khoảng 3% (lỗi nhẹ, không đổi nghĩa), ví dụ nhầm chữ cái đơn lẻ.

//       Quy tắc BẮT BUỘC về format đầu ra (JSON hợp lệ):
//         {
//           "title": "<title/hook chuẩn SEO, hấp dẫn>",
//           "description": "<mô tả ngắn SEO, tạo tò mò>",
//           "content": "<Nội dung chính, định dạng markdown>",
//           "thumb_prompt": "<Prompt mô tả ảnh thumbnail 400x224, phong cách hiện đại, liên quan nước hoa và chủ đề bài, ghi rõ tiêu đề bài>"
//         }
//         Trả về chính xác một object JSON, không markdown bọc ngoài, không giải thích thêm.
//   `;
// }

// class PostService {
//   async getPosts({ page = 1, limit = 10 }) {
//     const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
//     const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
//     const skip = (pageNum - 1) * limitNum;

//     const where = {
//       publishedAt: { not: null },
//     };

//     const [posts, totalItems] = await Promise.all([
//       prisma.post.findMany({
//         where,
//         skip,
//         take: limitNum,
//         orderBy: { publishedAt: "desc" },
//         select: {
//           id: true,
//           title: true,
//           description: true,
//           slug: true,
//           image: true,
//           minRead: true,
//           publishedAt: true,
//           createdAt: true,
//         },
//       }),
//       prisma.post.count({ where }),
//     ]);

//     const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

//     return serializeBigInt({
//       posts,
//       totalPages,
//       currentPage: pageNum,
//       totalItems,
//     });
//   }

//   async getById(id) {
//     let bid;
//     try {
//       bid = BigInt(id);
//     } catch {
//       return null;
//     }

//     const post = await prisma.post.findFirst({
//       where: {
//         id: bid,
//         publishedAt: { not: null },
//       },
//       include: {
//         postIdea: {
//           select: {
//             id: true,
//             title: true,
//             description: true,
//           },
//         },
//       },
//     });

//     return post ? serializeBigInt(post) : null;
//   }

//   /**
//    * Lấy 1 postIdea pending, gọi AI sinh bài, lưu Post, đánh dấu idea completed.
//    * @returns {object|null} post đã tạo hoặc null nếu không có idea
//    */
//   async generateSinglePostFromNextPendingIdea() {
//     const idea = await prisma.postIdea.findFirst({
//       where: { status: "pending" },
//       orderBy: { id: "asc" },
//     });

//     if (!idea) {
//       return null;
//     }

//     const prompt = buildPerfumeBlogPrompt(idea);

//     const output = Output.object({
//       schema: z.object({
//         title: z.string(),
//         description: z.string(),
//         content: z.string(),
//         thumb_prompt: z.string(),
//       }),
//     });

//     const response = await aiService.generateText("anthropic/claude-3-haiku", prompt, output);
//     const result = JSON.parse(response);

//     const thumbnailPath = await aiService.generateImage(result.thumb_prompt, "posts");

//     const baseSlug = slugify(result.title, {
//       replacement: "-",
//       lower: true,
//       locale: "vi",
//       trim: true,
//     });

//     let slug = baseSlug;
//     let suffix = 0;
//     while (
//       await prisma.post.findFirst({
//         where: { slug },
//       })
//     ) {
//       suffix += 1;
//       slug = `${baseSlug}-${suffix}`;
//     }

//     const authorUserId = BigInt(process.env.BLOG_POST_USER_ID || "1");

//     const post = await prisma.post.create({
//       data: {
//         userId: authorUserId,
//         postIdeaId: idea.id,
//         title: result.title,
//         slug,
//         description: result.description,
//         content: result.content,
//         image: thumbnailPath,
//         minRead: Math.max(1, Math.ceil(readingTime(result.content).minutes)),
//         publishedAt: new Date(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     });

//     await prisma.postIdea.update({
//       where: { id: idea.id },
//       data: { status: "completed" },
//     });

//     return serializeBigInt(post);
//   }
// }

// module.exports = new PostService();
