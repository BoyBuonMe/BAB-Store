const postService = require("@/services/post.service");
const postTransformer = require("@/transformers/post.transformer");

const getAll = async (req, res) => {
  const posts = await postService.getAll();
  const response = postTransformer(posts);
  res.success(response);
};

module.exports = { getAll };
