const express = require("express");

const postController = require("@/controllers/post.controller");

const router = express.Router();

router.get("/", postController.getPostsController);
router.get("/:id", postController.getPostByIdController);

module.exports = router;
