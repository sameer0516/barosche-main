const Product = require("../model/productModel");
const fs = require("fs");
const path = require("path");

/* ─── helpers ─── */
const slugify = (val) =>
  val.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const cleanupFiles = (files = []) =>
  files.forEach((f) => fs.unlink(f.path, () => { }));

const groupFilesByVariant = (files = []) => {
  const map = {};
  files.forEach((f) => {
    const match = f.fieldname.match(/^variantImages_(\d+)$/);
    if (match) {
      const idx = parseInt(match[1], 10);
      (map[idx] = map[idx] || []).push(`/uploads/${f.filename}`);
    }
  });
  return map;
};

const parseJsonArray = (raw, fallback = []) => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

/* ─── Build variant objects (shared by add & update) ─── */
const buildVariants = (variantsData, filesByVariant, existingVariants = []) =>
  variantsData.map((v, i) => ({
    ...(v._id ? { _id: v._id } : {}),
    name: v.name,
    title: v.title || "",
    description: v.description || "",
    materials: Array.isArray(v.materials) ? v.materials : [],
    gemstones: Array.isArray(v.gemstones) ? v.gemstones : [],
    metalType: Array.isArray(v.metalType) ? v.metalType : [],
    oldPrice: Number(v.oldPrice),
    newPrice: Number(v.newPrice),
    isSale: v.isSale === true || v.isSale === "true",
    inStock: v.inStock === true || v.inStock === "true",
    sizes: Array.isArray(v.sizes) ? v.sizes : [],
    images: [...(v.existingImages || []), ...(filesByVariant[i] || [])],
  }));


/* ─── CHECK SLUG ─── */
const checkSlug = async (req, res) => {
  try {
    const { slug, category, excludeId } = req.query;
    if (!slug) return res.status(400).json({ success: false, message: "slug is required" });

    const query = { slug };
    if (category) query.category = category;
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Product.findOne(query);
    return res.status(200).json({ success: true, exists: !!existing });
  } catch (error) {
    console.error("Error in checkSlug:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/* ─── ADD PRODUCT ─── */
const addProduct = async (req, res) => {
  try {
    const { title, slug, description, category } = req.body;

    if (!title || !description || !category) {
      cleanupFiles(req.files);
      return res.status(400).json({ success: false, message: "Title, description, and category are required." });
    }

    const variantsData = parseJsonArray(req.body.variantsData);
    if (!variantsData.length) {
      cleanupFiles(req.files);
      return res.status(400).json({ success: false, message: "At least one variant is required." });
    }

    const filesByVariant = groupFilesByVariant(req.files);
    const variants = buildVariants(variantsData, filesByVariant);

    for (let i = 0; i < variants.length; i++) {
      if (!variants[i].name) {
        cleanupFiles(req.files);
        return res.status(400).json({ success: false, message: `Variant ${i + 1} is missing a name.` });
      }
      if (!variants[i].images.length) {
        cleanupFiles(req.files);
        return res.status(400).json({ success: false, message: `Variant "${variants[i].name}" needs at least one image.` });
      }
    }

    const finalSlug = slug || slugify(title);
    const existing = await Product.findOne({ slug: finalSlug, category });
    if (existing) {
      cleanupFiles(req.files);
      return res.status(409).json({
        success: false,
        message: `Slug "${finalSlug}" already exists in category "${category}".`,
      });
    }

    const categories = parseJsonArray(req.body.categories, category ? [category] : []);
    const materials = parseJsonArray(req.body.materials);
    const gemstones = parseJsonArray(req.body.gemstones);

    const product = await Product.create({
      title, slug: finalSlug, description,
      category, categories, materials, gemstones,
      variants,
    });

    return res.status(201).json({ success: true, message: "Product added successfully!", product });
  } catch (error) {
    cleanupFiles(req.files);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A product with this slug already exists in this category." });
    }
    console.error("Error in addProduct:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


/* ─── UPDATE PRODUCT ─── */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      cleanupFiles(req.files);
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const { title, slug, description, category } = req.body;

    const variantsData = parseJsonArray(req.body.variantsData);
    if (!variantsData.length) {
      cleanupFiles(req.files);
      return res.status(400).json({ success: false, message: "At least one variant is required." });
    }

    // Delete removed images from disk
    const allKeptImages = new Set();
    variantsData.forEach((v) => (v.existingImages || []).forEach((img) => allKeptImages.add(img)));
    product.variants.forEach((variant) => {
      variant.images.forEach((imgPath) => {
        if (!allKeptImages.has(imgPath)) {
          const fullPath = path.join(__dirname, "..", imgPath);
          fs.unlink(fullPath, (err) => { if (err) console.warn("Could not delete:", fullPath); });
        }
      });
    });

    const filesByVariant = groupFilesByVariant(req.files);
    const variants = buildVariants(variantsData, filesByVariant, product.variants);

    for (let i = 0; i < variants.length; i++) {
      if (!variants[i].name) {
        cleanupFiles(req.files);
        return res.status(400).json({ success: false, message: `Variant ${i + 1} is missing a name.` });
      }
      if (!variants[i].images.length) {
        cleanupFiles(req.files);
        return res.status(400).json({ success: false, message: `Variant "${variants[i].name}" needs at least one image.` });
      }
    }

    const newSlug = slug || slugify(title || product.title);
    const newCategory = category || product.category;

    if (newSlug !== product.slug || newCategory !== product.category) {
      const slugExists = await Product.findOne({
        slug: newSlug, category: newCategory,
        _id: { $ne: product._id },
      });
      if (slugExists) {
        cleanupFiles(req.files);
        return res.status(409).json({
          success: false,
          message: `Slug "${newSlug}" is already in use in category "${newCategory}".`,
        });
      }
    }

    const categories = parseJsonArray(req.body.categories, newCategory ? [newCategory] : []);
    const materials = parseJsonArray(req.body.materials, product.materials || []);
    const gemstones = parseJsonArray(req.body.gemstones, product.gemstones || []);

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title: title || product.title,
        slug: newSlug,
        description: description || product.description,
        category: newCategory,
        categories, materials, gemstones,
        variants,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: "Product updated successfully!", product: updated });
  } catch (error) {
    cleanupFiles(req.files);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A product with this slug already exists in this category." });
    }
    console.error("Error in updateProduct:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


/* ─── GET ALL ─── */
const getAllProducts = async (req, res) => {
  try {
    const { category, isSale, material, gemstone, metalType } = req.query;
    const filter = {};

    if (category) {
      filter.$or = [
        { category: category },
        { categories: { $in: [category] } },
      ];
    }
    if (isSale === "true") filter.variants = { $elemMatch: { isSale: true } };
    if (isSale === "false") filter.variants = { $not: { $elemMatch: { isSale: true } } };
    if (material) filter.materials = material;
    if (gemstone) filter.gemstones = gemstone;
    if (metalType) {
      filter.variants = filter.variants
        ? { ...filter.variants, $elemMatch: { ...(filter.variants.$elemMatch || {}), metalType: metalType } }
        : { $elemMatch: { metalType: metalType } };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/* ─── GET BY SLUG ─── */
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/* ─── DELETE ─── */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.variants.forEach((variant) => {
      variant.images.forEach((imgPath) => {
        const fullPath = path.join(__dirname, "..", imgPath);
        fs.unlink(fullPath, (err) => { if (err) console.warn(`Could not delete: ${fullPath}`); });
      });
    });

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { addProduct, updateProduct, getAllProducts, getProductBySlug, deleteProduct, checkSlug };