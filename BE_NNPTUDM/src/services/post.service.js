const prisma = require("@/libs/prisma");

class PostService {
  async getAll() {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        minRead: true,
        image: true,
        publishedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return posts;
  }
}

module.exports = new PostService();
