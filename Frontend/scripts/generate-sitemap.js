const fs = require("fs");
const path = require("path");

const SITE_URL = "https://barosche.com";
const API_BASE_URL = "https://api.barosche.com";

async function generateSitemap() {
    const urls = [];
    const staticPages = [
        { url: "/", priority: 1.0 },

        { url: "/product-category/jewellery/", priority: 0.9 },
        { url: "/product-category/rings/", priority: 0.9 },
        { url: "/product-category/earrings/", priority: 0.9 },
        { url: "/product-category/pendants/", priority: 0.9 },
        { url: "/product-category/bracelets/", priority: 0.9 },
        { url: "/product-category/chosen-jewellery/", priority: 0.9 },
        { url: "/product-category/for-today-jewellery/", priority: 0.9 },
        { url: "/product-category/womens/", priority: 0.9 },
        { url: "/product-category/new-in/", priority: 0.9 },
        { url: "/product-category/mens/", priority: 0.9 },

        { url: "/blogs/", priority: 0.8 },

        { url: "/shop/", priority: 0.8 },
        { url: "/wishlist/", priority: 0.8 },

        { url: "/about/", priority: 0.7 },
        { url: "/contact-us/", priority: 0.7 },
        { url: "/our-services/", priority: 0.7 },
        { url: "/size-guide/", priority: 0.7 },
        { url: "/guide/", priority: 0.7 },
        { url: "/frequently-asked-questions/", priority: 0.7 },
        { url: "/shipping/", priority: 0.7 },
        { url: "/return-cancellation-policy/", priority: 0.7 },
        { url: "/sourcing-manufacturing/", priority: 0.7 },
        { url: "/imprint/", priority: 0.7 },

        { url: "/privacy-policy/", priority: 0.5 },
        { url: "/terms-of-service/", priority: 0.5 },
    ];

    staticPages.forEach((page) => {
        urls.push(`
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    });

    console.log("Using API_BASE_URL:", API_BASE_URL);

    try {
        const productsUrl = `${API_BASE_URL}/api/products`;
        console.log("Fetching products from:", productsUrl);

        const res = await fetch(productsUrl);

        console.log("Products API status:", res.status);

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Products API ${res.status} - ${text.slice(0, 200)}`);
        }

        const data = await res.json();

        console.log("Products raw response keys:", Object.keys(data));

        const products = data.products || data.data || [];

        console.log("Total Products found:", products.length);

        if (products.length > 0) {
            console.log("Sample product:", JSON.stringify(products[0], null, 2));
        }

        const validProducts = products.filter((product) => product.slug && product.category);
        console.log("Valid products (with slug & category):", validProducts.length);

        validProducts.forEach((product) => {
            urls.push(`
  <url>
    <loc>${SITE_URL}/product-category/${product.category.toLowerCase()}/${product.slug}/</loc>
    <lastmod>${new Date(
                    product.updatedAt || Date.now()
                ).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
        });

    } catch (err) {
        console.error("❌ Products Error:", err.message);
        console.error("Full error:", err);
    }

    try {
        const blogsUrl = `${API_BASE_URL}/api/blogs`;
        console.log("Fetching blogs from:", blogsUrl);

        const res = await fetch(blogsUrl);

        console.log("Blogs API status:", res.status);

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Blogs API ${res.status} - ${text.slice(0, 200)}`);
        }

        const blogs = await res.json();

        console.log("Total Blogs found:", blogs.length);

        if (blogs.length > 0) {
            console.log("Sample blog:", JSON.stringify(blogs[0], null, 2));
        }

        blogs
            .filter((blog) => blog.slug || blog.urlHandle)
            .forEach((blog) => {
                const blogSlug = blog.urlHandle || blog.slug;

                urls.push(`
     <url>
    <loc>${SITE_URL}/blogs/${blogSlug}/</loc>
    <lastmod>${new Date(
                    blog.updatedAt || Date.now()
                ).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
            });

    } catch (err) {
        console.error("❌ Blogs Error:", err.message);
        console.error("Full error:", err);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    fs.writeFileSync(
        path.join(__dirname, "../public/sitemap.xml"),
        sitemap,
        "utf8"
    );

    console.log(" Sitemap Generated Successfully with", urls.length, "URLs");
}

generateSitemap();