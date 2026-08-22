// app/guide/[slug]/page.jsx
import GuideSlugClient from "./GuideSlugClient";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  try {
    console.log("🔍 [guide] API_URL:", API_URL);

    if (!API_URL) {
      console.log("⚠️ [guide] API_URL missing, sirf placeholder return ho raha hai");
      return [{ slug: "placeholder" }];
    }

    const res = await fetch(`${API_URL}/api/guides`, { cache: "no-store" });
    console.log("🔍 [guide] API response status:", res.status);

    if (!res.ok) {
      return [{ slug: "placeholder" }];
    }

    const guides = await res.json();
    console.log(
      "🔍 [guide] Total guides mile:",
      Array.isArray(guides) ? guides.length : "not an array"
    );

    if (!Array.isArray(guides) || guides.length === 0) {
      return [{ slug: "placeholder" }];
    }

    guides.forEach((guide) => {
      const s = guide.urlHandle || guide.slug;
      if (!s || typeof s !== "string" || s.trim().length === 0) {
        console.log(
          "❌ [guide] Slug missing is guide mein — id:",
          guide._id,
          "| title:",
          guide.title
        );
      }
    });

    const validSlugs = guides
      .map((guide) => guide.urlHandle || guide.slug)
      .filter((slug) => typeof slug === "string" && slug.trim().length > 0)
      .map((slug) => ({ slug: slug.trim() }));

    const uniqueSlugs = Array.from(
      new Map(validSlugs.map((item) => [item.slug, item])).values()
    );

    return [{ slug: "placeholder" }, ...uniqueSlugs];
  } catch (error) {
    console.error("[guide] generateStaticParams error:", error);
    return [{ slug: "placeholder" }];
  }
}

export default function Page({ params }) {
  return <GuideSlugClient params={params} />;
}