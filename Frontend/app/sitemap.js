export const dynamic = "force-static";
export const revalidate = 3600;
const SITE_URL = "https://barosche.com";
const API_URL = "https://api.barosche.com";

const getRoute = (category = "") => {
  const cat = category.toLowerCase().trim();
  if (cat.includes("earring")) return "/product-category/earrings";
  if (cat.includes("bracelet")) return "/product-category/bracelets";
  if (cat.includes("pendant")) return "/product-category/pendants";
  if (cat.includes("chosen")) return "/product-category/chosen-jewellery";
  if (cat.includes("for today") || cat.includes("fortoday")) return "/product-category/for-today-jewellery";
  if (cat.includes("new")) return "/product-category/new-in";
  if (cat === "men" || cat === "mens" || cat.includes("men pendant")) return "/product-category/mens";
  if (cat === "women" || cat === "womens" || cat.includes("woman pendant")) return "/product-category/womens";
  if (cat.includes("ring")) return "/product-category/rings";
  if (cat.includes("jewellery") || cat.includes("jewelry")) return "/product-category/jewellery";

  console.warn(`Sitemap: unmapped category "${category}", using fallback route /product-category/jewellery`);
  return "/product-category/jewellery";
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.blogs)) return payload.blogs;
  return [];
};

export default async function sitemap() {

  const staticPages = [
    { url: `${SITE_URL}/`, priority: 1.0 },
    { url: `${SITE_URL}/product-category/pendants`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/rings`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/earrings`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/bracelets`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/chosen-jewellery`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/for-today-jewellery`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/new-in`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/mens`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/womens`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/jewellery-gifts-for-her`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/christmas-jewellery-gifts`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/valentine-jewellery-gifts`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/gold-jewellery-gifts`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/luxury-jewellery-gifts`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/jewellery-gifts-for-girlfriend`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/gifts-for-her`, priority: 0.8 },
    { url: `${SITE_URL}/product-category/minimalist-dainty-jewellery-gifts`, priority: 0.8 },
    { url: `${SITE_URL}/blogs`, priority: 0.8 },
    { url: `${SITE_URL}/about`, priority: 0.7 },
    { url: `${SITE_URL}/return`, priority: 0.6 },
    { url: `${SITE_URL}/faqs`, priority: 0.6 },
    { url: `${SITE_URL}/privacy`, priority: 0.5 },
    { url: `${SITE_URL}/terms`, priority: 0.5 },
  ].map(({ url, priority }) => ({
    url,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));

  let productPages = [];

  try {
    const res = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Products API returned ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    const products = extractArray(payload);

    if (products.length === 0) {
      console.error(
        `Sitemap: products API returned 0 usable items. Raw payload keys: ${
          typeof payload === "object" ? Object.keys(payload).join(", ") : typeof payload
        }`
      );
    }

    const seenSlugs = new Set();

    productPages = products
      .map((product) => {
        if (!product.slug) {
          console.warn(`Sitemap: product missing slug, skipping (id: ${product._id || "unknown"})`);
          return null;
        }
        if (seenSlugs.has(product.slug)) return null;
        seenSlugs.add(product.slug);

        const route = getRoute(product.category);

        return {
          url: `${SITE_URL}${route}/${product.slug}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        };
      })
      .filter(Boolean);

    console.log(`Sitemap: ${productPages.length} product URLs generated out of ${products.length} products fetched`);

  } catch (err) {
    console.error("Sitemap: PRODUCT FETCH FAILED —", err.message);
  }

  let blogPages = [];

  try {
    const res = await fetch(`${API_URL}/api/blogs`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Blogs API returned ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    const blogs = extractArray(payload);
    const seenBlogSlugs = new Set();

    blogPages = blogs
      .map((blog) => {
        const slug = blog.urlHandle || blog.slug;
        if (!slug) return null;
        if (seenBlogSlugs.has(slug)) return null;
        seenBlogSlugs.add(slug);

        return {
          url: `${SITE_URL}/blogs/${slug}`,
          lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        };
      })
      .filter(Boolean);

    console.log(`Sitemap: ${blogPages.length} blog URLs generated`);

  } catch (err) {
    console.error("Sitemap: BLOG FETCH FAILED —", err.message);
  }

  return [...staticPages, ...productPages, ...blogPages];
}