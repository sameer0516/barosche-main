// app/blog/[slug]/page.jsx
import { notFound } from "next/navigation";
import blogs from "../data";
import BlogClient from "./BlogClient";

export async function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) return {};
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.description,
  };
}

export default async function BlogSlugPage({ params }) {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) return notFound();

  return <BlogClient blog={blog} />;
}