// lib/getBlogs.js
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

let blogsPromise = null;

export async function fetchAllBlogsOnce() {
  if (blogsPromise) return blogsPromise;

  blogsPromise = (async () => {
    if (!API_URL) {
      console.log("⚠️ [blogs] API_URL missing");
      return [];
    }

    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${API_URL}/api/blogs`, {
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          console.log(`⚠️ [blogs] Attempt ${attempt} status:`, res.status);
          lastError = new Error(`Status ${res.status}`);
          continue;
        }

        const blogs = await res.json();
        if (!Array.isArray(blogs)) {
          lastError = new Error("Response not an array");
          continue;
        }

        console.log(` [blogs] Attempt ${attempt} success, total blogs:`, blogs.length);
        return blogs;
      } catch (error) {
        console.log(`⚠️ [blogs] Attempt ${attempt} error:`, error.message);
        lastError = error;
      }
    }

    console.error("❌ [blogs] Saari retries fail ho gayi:", lastError?.message);
    return [];
  })();

  return blogsPromise;
}

export async function getBlog(slug) {
  if (!slug || slug === "placeholder") return null;

  const blogs = await fetchAllBlogsOnce();

  if (blogs.length === 0) {
    console.log(`⚠️ [blogs/${slug}] Blogs list hi khaali aayi`);
    return null;
  }

  const found = blogs.find((b) => (b.urlHandle || b.slug) === slug);

  if (!found) {
    console.log(`⚠️ [blogs/${slug}] Is slug ka blog list me nahi mila`);
  } else {
    console.log(` [blogs/${slug}] Blog mil gaya:`, found.title);
  }

  return found || null;
}

export { API_URL };