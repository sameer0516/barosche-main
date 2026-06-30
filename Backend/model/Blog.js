const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: String,

    slug: {
      type: String,
      unique: true,
    },

    description: String,

    image: String,

    altTag: String,

    tags: [String],

    seoTitle: String,

    seoDescription: String,

    content: String,

    status: {
      type: String,
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);