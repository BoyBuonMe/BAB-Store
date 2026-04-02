require("dotenv").config();
require("module-alias/register");
const axios = require("axios");

const prisma = require("@/libs/prisma");

async function generateAndSaveIdeas() {
  console.log("🤖 Đang gọi AI để sinh post ideas...");

  // Bước 1: Gọi thẳng AI server
  const aiResponse = await axios.post(
    "https://openapi.huydarealest.dev/v1/chat/completions",
    {
      model: "codex-5",
      messages: [
        {
          role: "user",
          content: `Tìm 10 ý tưởng viết blog chủ đề nước hoa, mùi hương và phong cách sử dụng nước hoa cho độc giả Việt Nam.
      - Đánh giá xem người Việt khi tìm hiểu nước hoa thường quan tâm: chọn mùi theo mùa, theo dịp, phân biệt các nhóm hương, cách bảo quản, layering, nước hoa nam/nữ/unisex, mùi văn phòng vs dự tiệc, v.v.
      - Mục tiêu là chọn các chủ đề hữu ích, dễ đọc, mang lại giá trị thực tế (ưu tiên hàng đầu)
      - Đảm bảo các chủ đề không trùng lặp, có thể đa dạng về góc nhìn
        BẮT BUỘC VỀ ĐỊNH DẠNG ĐẦU RA LÀ JSON NHƯ SAU: [
      {
        "title": "<tiêu đề topic 1>",
        "description": "<Mô tả mục tiêu cần đạt được trong nội dung chi tiết cho topic 1>"
      },
      {
        "title": "<tiêu đề topic 2>",
        "description": "<Mô tả mục tiêu cần đạt được trong nội dung chi tiết cho topic 2>"
      },
      ...,
      {
        "title": "<tiêu đề topic 100>",
        "description": "<Mô tả mục tiêu cần đạt được trong nội dung chi tiết cho topic 100>"
      }
    ]
    Trả về chính xác định dạng JSON trên, không bao gồm thêm bất cứ điều gì như: giải thích, kết luận, ..., không sử dụng markdown.`,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
    },
  );

  // Bước 2: Parse JSON từ response AI
  const rawContent = aiResponse.data.choices[0].message.content;
  const cleaned = rawContent
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  const ideas = JSON.parse(cleaned);

  // Bước 3: Lưu thẳng vào DB qua Prisma
  const saved = await prisma.$transaction(
    ideas.map((idea) =>
      prisma.postIdea.create({
        data: {
          title: idea.title,
          description: idea.description,
          status: "pending",
        },
      }),
    ),
  );

  console.log(`✅ Đã lưu ${saved.length} ideas vào DB!`);
  console.table(saved.map((i) => ({ id: String(i.id), title: i.title, status: i.status })));

  await prisma.$disconnect();
}

generateAndSaveIdeas().catch((err) => {
  console.error("❌ Lỗi:", err.message);
  process.exit(1);
});

// require("dotenv").config();
// require("module-alias/register");
// const { Output } = require("ai");
// const { z } = require("zod");
// const aiService = require("@/services/ai.service");
// const prisma = require("@/libs/prisma");

// async function main() {
//   const ideas = await prisma.postIdea.findMany({
//     select: {
//       title: true,
//     },
//   });
//   const titles = ideas.map((idea) => idea.title);
//   const prompt = `
//     Tìm 10 ý tưởng viết blog chủ đề nước hoa, mùi hương và phong cách sử dụng nước hoa cho độc giả Việt Nam.
//     - Đánh giá xem người Việt khi tìm hiểu nước hoa thường quan tâm: chọn mùi theo mùa, theo dịp, phân biệt các nhóm hương, cách bảo quản, layering, nước hoa nam/nữ/unisex, mùi văn phòng vs dự tiệc, v.v.
//     - Mục tiêu là chọn các chủ đề hữu ích, dễ đọc, mang lại giá trị thực tế (ưu tiên hàng đầu)
//     - Đảm bảo các chủ đề không trùng lặp, có thể đa dạng về góc nhìn
//     - Các ý tưởng mới không được trùng với các ý tưởng đã có, danh sách ý tưởng đã có:
//         - ${titles.join(`
//         - `)}

// BẮT BUỘC VỀ ĐỊNH DẠNG ĐẦU RA LÀ JSON NHƯ SAU: [
//   {
//     "title": "<tiêu đề topic 1>",
//     "description": "<Mô tả mục tiêu cần đạt được trong nội dung chi tiết cho topic 1>"
//   },
//   {
//     "title": "<tiêu đề topic 2>",
//     "description": "<Mô tả mục tiêu cần đạt được trong nội dung chi tiết cho topic 2>"
//   },
//   ...,
//   {
//     "title": "<tiêu đề topic 100>",
//     "description": "<Mô tả mục tiêu cần đạt được trong nội dung chi tiết cho topic 100>"
//   }
// ]
// Trả về chính xác định dạng JSON trên, không bao gồm thêm bất cứ điều gì như: giải thích, kết luận, ..., không sử dụng markdown.
//   `;
//   console.log(prompt);

//   const output = Output.array({
//     element: z.object({
//       title: z.string(),
//       description: z.string(),
//     }),
//   });
//   const response = await aiService.webSearch(prompt, output);
//   const postIdeas = JSON.parse(response).elements;

//   await prisma.postIdea.createMany({
//     data: postIdeas,
//   });
// }

// main();
