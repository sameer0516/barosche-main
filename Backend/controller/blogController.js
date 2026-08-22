const Blog = require("../model/Blog");
const slugify = require("slugify");

// Blog create karo
exports.createBlog = async (req, res) => {
  try {
    const blog = await Blog.create({
      title: req.body.title,
      slug: slugify(req.body.title, { lower: true, strict: true }),
      description: req.body.description,
      image: req.body.image,
      altTag: req.body.altTag,
      tags: req.body.tags,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      content: req.body.content,
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Saare blogs lao
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ek blog slug se lao
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};