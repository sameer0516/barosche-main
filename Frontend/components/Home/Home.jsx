import Header from "@/components/Home/Header/Header";
import Collection from "@/components/Home/Collection/Collection"
import Signature from "@/components/Home/Signature/Signature"
import Category from "@/components/Home/Category/Category"
import Tsavéline from "@/components/Home/Tsavéline/Tsavéline"
import Trending from "@/components/Home/Trending Arrivals/Trending"
import EarringsRings from"@/components/Home/Earrings-Rings/EarringsRings"
import Reviews from "@/components/Home/Reviews/Reviews"
import Faq from "@/components/Home/Faq/Faq"

export const metadata = {
  title: "Barosche | Luxury Handcrafted Jewellery",
  description: "Explore Barosche's exclusive collection of handcrafted rings, earrings, and pendants. Timeless luxury jewellery designed for every occasion.",
  
  openGraph: {
    title: "Barosche | Luxury Handcrafted Jewellery",
    description: "Explore Barosche's exclusive collection of handcrafted rings, earrings, and pendants. Timeless luxury jewellery designed for every occasion.",
    url: "https://www.barosche.com",
    siteName: "Barosche",
    images: [
      {
        url: "https://www.barosche.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Barosche Luxury Jewellery Collection",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Barosche | Luxury Handcrafted Jewellery",
    description: "Explore Barosche's exclusive collection of handcrafted rings, earrings, and pendants. Timeless luxury jewellery designed for every occasion.",
    site: "@barosche", 
    creator: "@barosche",
    images: ["https://www.barosche.com/og-image.jpg"],
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <Collection />
      <Signature />
      <Category />
      <Tsavéline />
      <Trending />
      <EarringsRings/>
      <Reviews/>
      <Faq/>
    </>
  );
}