const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    author: { type: String, default: "Barosché" },
    image: { type: String, default: "" },
    altTag: { type: String, default: "" },
    content: { type: String, required: true },
    pageTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    urlHandle: { type: String, unique: true, sparse: true },
    script: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Blog", "Guides"],
      default: "Blog",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);