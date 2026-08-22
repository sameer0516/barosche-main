import BlogClient from "./BlogClient";
import { notFound } from "next/navigation";
import { fetchAllBlogsOnce, getBlog, API_URL } from "@/lib/getBlogs";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://barosche.com";

export async function generateStaticParams() {
  const blogs = await fetchAllBlogsOnce();

  if (blogs.length === 0) {
    return [{ slug: "placeholder" }];
  }

  blogs.forEach((blog) => {
    const s = blog.urlHandle || blog.slug;
    if (!s || typeof s !== "string" || s.trim().length === 0) {
      console.log("❌ [blogs] Slug missing is blog mein — id:", blog._id, "| title:", blog.title);
    }
  });

  const validSlugs = blogs
    .map((blog) => blog.urlHandle || blog.slug)
    .filter((slug) => typeof slug === "string" && slug.trim().length > 0)
    .map((slug) => ({ slug: slug.trim() }));

  const uniqueSlugs = Array.from(
    new Map(validSlugs.map((item) => [item.slug, item])).values()
  );

  console.log("🔍 [blogs] Generated slugs count:", uniqueSlugs.length);

  return [{ slug: "placeholder" }, ...uniqueSlugs];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  const canonicalUrl = `${SITE_URL}/blogs/${slug}/`;

  if (!blog) {
    return {
      title: "Barosché | Fine Jewellery Blog",
      description: "Explore fine jewellery guides, trends and tips from Barosché.",
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const imageUrl = blog.image
    ? blog.image.startsWith("http")
      ? blog.image
      : `${API_URL}${blog.image}`
    : undefined;

  return {
    title: blog.pageTitle || blog.title,
    description: blog.metaDescription || "",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.pageTitle || blog.title,
      description: blog.metaDescription || "",
      url: canonicalUrl,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BlogSlugPage({ params }) {
  const { slug } = await params;

  if (slug === "placeholder") {
    return notFound();
  }

  const blog = await getBlog(slug);

  return <BlogClient initialBlog={blog} slug={slug} />;
}