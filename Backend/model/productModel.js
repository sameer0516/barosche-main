const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Variant name is required"], trim: true },

    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },

    materials: { type: [String], default: [] },
    gemstones: { type: [String], default: [] },
    metalType: { type: [String], default: [] },

    oldPrice: { type: Number, required: [true, "Old price is required"], min: 0 },
    newPrice: { type: Number, required: [true, "New price is required"], min: 0 },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least one image is required per variant",
      },
    },
    isSale: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    sizes: { type: [String], default: [] },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Rings", "Jewellery", "Necklaces", "Earrings", "Bracelets", "Mens", "Womens",
        "For Today", "Chosen", "Pendants", "Anklets", "Brooches", "Other", "New",
      ],
    },
    categories: { type: [String], default: [] },
    materials:  { type: [String], default: [] },
    gemstones:  { type: [String], default: [] },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least one variant is required",
      },
    },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);