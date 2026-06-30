// app/sitemap.js

export const dynamic = "force-static";

const SITE_URL = "https://barosche.com";
const API_BASE_URL = "https://api.barosche.com";

export default async function sitemap() {
  const staticPages = [
    { url: `${SITE_URL}/`, priority: 1.0 },

    { url: `${SITE_URL}/product-category/jewellery`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/rings`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/earrings`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/pendants`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/chosen-jewellery`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/for-today-jewellery`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/womens`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/new-in`, priority: 0.9 },
    { url: `${SITE_URL}/product-category/mens`, priority: 0.9 },

    { url: `${SITE_URL}/blogs`, priority: 0.8 },

    { url: `${SITE_URL}/about`, priority: 0.7 },
    { url: `${SITE_URL}/contact-us`, priority: 0.7 },
    { url: `${SITE_URL}/our-services`, priority: 0.7 },

    { url: `${SITE_URL}/privacy-policy`, priority: 0.5 },
    { url: `${SITE_URL}/terms-of-service`, priority: 0.5 },
  ].map(({ url, priority }) => ({
    url,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));

  let productPages = [];
  let blogPages = [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const products = data.products || [];

    productPages = products
      .filter((p) => p.slug)
      .map((product) => ({
        url: `${SITE_URL}/product-category/${product.category.toLowerCase()}/${product.slug}`,
        lastModified: product.updatedAt
          ? new Date(product.updatedAt)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (err) {
    console.error("Products sitemap failed:", err);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const blogs = data.blogs || [];

    blogPages = blogs
      .filter((b) => b.slug)
      .map((blog) => ({
        url: `${SITE_URL}/blogs/${blog.slug}`,
        lastModified: blog.updatedAt
          ? new Date(blog.updatedAt)
          : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));
  } catch (err) {
    console.error("Blogs sitemap failed:", err);
  }

  return [...staticPages, ...productPages, ...blogPages];
}