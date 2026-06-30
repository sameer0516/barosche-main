import BlogPage from './BlogPage';
export const metadata = {
  title: "Latest Insights on Fashion, Jewellery & Lifestyle Trends | Blog",
  description:
    "Explore our blogs for the latest updates, fashion inspiration, jewellery trends, styling tips & lifestyle insights. Stay ahead with expert ideas & timeless elegance from Barosche.",
  keywords: [
    "Barosche Jewellery",
    "About Barosche",
    "Luxury Jewellery",
    "Diamond Jewellery",
    "Gold Jewellery",
    "Custom Jewellery",
    "Fine Jewellery"
  ],
  openGraph: {
    title: "Latest Insights on Fashion, Jewellery & Lifestyle Trends | Blog",
    description:
      "Explore our blogs for the latest updates, fashion inspiration, jewellery trends, styling tips & lifestyle insights. Stay ahead with expert ideas & timeless elegance from Barosche.",
    type: "website",
  },
};

export default function Page() {
  return <BlogPage />;
}