import BlogPage from './BlogPage';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const PAGE_URL = "https://barosche.com/blogs/";
const OG_IMAGE = "/logo.png";
const TITLE = "Latest Insights on Fashion, Jewellery & Lifestyle Trends | Blog";
const DESCRIPTION =
  "Explore our blogs for the latest updates, fashion inspiration, jewellery trends, styling tips & lifestyle insights. Stay ahead with expert ideas & timeless elegance from Barosche.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getInitialBlogs() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/blogs`, FETCH_TIMEOUT_MS);
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      const data = await res.json();
      const blogs = Array.isArray(data) ? data : [];
      return blogs.filter((blog) => (blog.category || "Blog") === "Blog");
    } catch (err) {
      console.error(`[BlogPage] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  console.error("[BlogPage] All retries failed — page will render with empty blog list.");
  return [];
}

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: PAGE_URL,
  },

  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Barosche",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 2048,
        height: 997,
        alt: "Barosche Blog - Jewellery & Lifestyle Insights",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    site: "@barosche",
    creator: "@barosche",
    images: [
      {
        url: OG_IMAGE,
        alt: "Barosche Blog - Jewellery & Lifestyle Insights",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default async function Page() {
  const initialBlogs = await getInitialBlogs();
  return <BlogPage initialBlogs={initialBlogs} />;
}