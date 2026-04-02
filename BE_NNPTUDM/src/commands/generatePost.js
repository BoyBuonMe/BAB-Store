require("dotenv").config();
require("module-alias/register");
const axios = require("axios");
const prisma = require("@/libs/prisma");

async function getRandomImage() {
  const keywords = ["perfume", "fragrance", "cologne", "scent", "luxury perfume"];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

  const response = await axios.get("https://api.unsplash.com/photos/random", {
    params: {
      query: randomKeyword,
      orientation: "landscape",
    },
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
  });

  return response.data.urls.regular; // URL ảnh chất lượng tốt
}

async function generatePost(idea) {
  const prompt = `Bạn hãy viết một bài blog chuyên sâu về nước hoa và mùi hương dành cho độc giả Việt Nam. Bài viết phải tuân thủ nghiêm ngặt các tiêu chí sau:

    Thông tin đầu vào:
      - Chủ đề bài viết (Title): ${idea.title}
      - Mục tiêu và phạm vi (Description): ${idea.description}

    Cấu trúc và yêu cầu bài viết:

      Tiêu đề và mở đầu:
        - Tạo title/hook hấp dẫn từ title đã cho. Tuyệt đối không dùng Title Case kiểu tiếng Anh cho mọi chữ. Chỉ viết hoa chữ cái đầu câu và danh từ riêng nếu có.
        - Viết một đoạn mở bài khoảng 200-300 từ. Giới thiệu chủ đề một cách thân thiện, giải thích tại sao nó quan trọng với người yêu nước hoa, và mô tả ngắn gọn những gì độc giả sẽ học được.

      Nội dung chính:
        - Nội dung khoảng 800 - 1000 từ, chia thành 4 đến 5 phần lớn với các tiêu đề con (dùng heading H2, H3). Cấu trúc đi từ khái niệm cơ bản (ví dụ: hương đầu/giữa/cuối, độ lưu hương, độ tỏa), đến gợi ý chọn nước hoa theo mùa/phong cách/dịp sử dụng, rồi mẹo thực tế (bảo quản, xịt đúng cách, layering nhẹ nhàng nếu phù hợp).
        - Văn phong: Dùng ngôi "mình" hoặc "tôi" (đồng nhất trong cả bài), gần gũi, tôn trọng độc giả. Tránh biệt ngữ quá hàn lâm nếu không giải thích.
        - Với mỗi khái niệm quan trọng: (a) Định nghĩa đơn giản bằng tiếng Việt, (b) Một ví dụ so sánh từ đời thường, (c) Gợi ý áp dụng thực tế.
        - Không bắt buộc có đoạn code. Nếu nhắc đến thành phần hương, hãy mô tả bằng ngôn ngữ dễ hiểu.

      Kết bài:
        - Tóm tắt ngắn gọn 3-5 điểm chính.
        - Đề xuất một hành động nhỏ độc giả có thể làm ngay.

      Quy tắc bắt buộc về hình thức:
        - Tránh lạm dụng thuật ngữ tiếng Anh không giải thích
        - Tuyệt đối không sử dụng emoji hay ký tự trang trí (như ⭐, ✅, 🚀, ---).
        - Thay "->" thay vì mũi tên đặc biệt nếu cần
        - Chỉ dùng định dạng markdown cơ bản: in đậm, in nghiêng, danh sách, heading.
        - Cố ý tạo lỗi đánh máy ngẫu nhiên khoảng 3%.

      Quy tắc BẮT BUỘC về format đầu ra (JSON hợp lệ):
        {
          "title": "<title/hook chuẩn SEO, hấp dẫn>",
          "description": "<mô tả ngắn SEO, tạo tò mò>",
          "content": "<Nội dung chính, định dạng markdown>",
          "thumb_prompt": "<Prompt mô tả ảnh thumbnail 400x224, phong cách hiện đại, liên quan nước hoa và chủ đề bài, ghi rõ tiêu đề bài>"
        }
        Trả về chính xác một object JSON, không markdown bọc ngoài, không giải thích thêm.`;

  const aiResponse = await axios.post(
    "https://openapi.huydarealest.dev/v1/chat/completions",
    {
      model: "codex-5",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
    }
  );

  const rawContent = aiResponse.data.choices[0].message.content;
  const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") + "-" + Date.now();
}

async function main() {
  // Lấy các ideas chưa có post nào (posts rỗng)
  const ideas = await prisma.postIdea.findMany({
    where: {
      status: "pending",
      posts: { none: {} },
    },
  });

  if (!ideas.length) {
    console.log("⚠️  Không có idea nào ở trạng thái pending. Hãy chạy npm run ai trước.");
    await prisma.$disconnect();
    return;
  }

  console.log(`📝 Tìm thấy ${ideas.length} ideas, bắt đầu generate posts...\n`);

  for (const idea of ideas) {
    try {
      console.log(`⏳ Đang generate: "${idea.title}"`);

      const postData = await generatePost(idea);

      const imageUrl = await getRandomImage();

      await prisma.post.create({
        data: {
          userId: BigInt(4), // TODO: đổi thành userId thực tế
          postIdeaId: idea.id,
          title: postData.title,
          description: postData.description,
          slug: generateSlug(postData.title),
          image: imageUrl,
          content: postData.content,
          minRead: Math.ceil(postData.content.split(" ").length / 200),
        },
      });
      
      // Cập nhật status idea -> done
      await prisma.postIdea.update({
        where: { id: idea.id },
        data: { status: "done" },
      });

      console.log(`✅ Done: "${postData.title}"\n`);
    } catch (err) {
      console.error(`❌ Lỗi với idea "${idea.title}":`, err.message);
      // Bỏ qua idea lỗi, tiếp tục idea kế tiếp
    }
  }

  console.log("🎉 Hoàn tất generate tất cả posts!");
  await prisma.$disconnect();
}

main();

// require("dotenv").config();
// require("module-alias/register");

// const postService = require("@/services/post.service");

// async function main() {
//   const post = await postService.generateSinglePostFromNextPendingIdea();
//   if (!post) {
//     console.log("No pending post idea.");
//     return;
//   }
//   console.log("Created post:", post);
// }

// main();
