require("module-alias/register");
// const postService = require("@/services/post.service");
const {getPosts, getPostById} = require("@/services/post.service");

async function getPostsController(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));

    const data = await getPosts({ page, limit });

    // BigInt không serialize được mặc định, cần convert
    const posts = data.posts.map((p) => ({ ...p, id: String(p.id) }));

    return res.json({ ...data, posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function getPostByIdController(req, res) {
  try {
    const post = await getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    return res.json({ ...post, id: String(post.id) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getPostsController, getPostByIdController };

// const postService = require("@/services/post.service");
// const postTransformer = require("@/transformers/post.transformer");
// const { httpCodes } = require("@/config/constants");

// const getPosts = async (req, res) => {
//   try {
//     const { page, limit } = req.query;
//     const raw = await postService.getPosts({ page, limit });
//     const postsTransformed = postTransformer(raw.posts);
//     return res.success({
//       message: "Lấy danh sách bài viết thành công",
//       data: {
//         posts: postsTransformed,
//         totalPages: raw.totalPages,
//         currentPage: raw.currentPage,
//         totalItems: raw.totalItems,
//       },
//     });
//   } catch (error) {
//     return res.error(
//       { message: error.message || "Không lấy được danh sách bài viết" },
//       httpCodes.internalServerError,
//     );
//   }
// };

// const getPostById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const post = await postService.getById(id);

//     if (!post) {
//       return res.error({ message: "Không tìm thấy bài viết" }, httpCodes.notFound);
//     }

//     const [transformed] = postTransformer([post]);
//     return res.success({
//       message: "Lấy chi tiết bài viết thành công",
//       data: transformed,
//     });
//   } catch (error) {
//     return res.error(
//       { message: error.message || "Không lấy được chi tiết bài viết" },
//       httpCodes.internalServerError,
//     );
//   }
// };

// module.exports = { getPosts, getPostById };
