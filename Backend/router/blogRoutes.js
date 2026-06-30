const express = require("express");

const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlogBySlug,
} = require("../controller/blogController");

router.post(
  "/create-blog",
  createBlog
);

router.get("/blogs", getBlogs);

router.get(
  "/blog/:slug",
  getBlogBySlug
);

module.exports = router;