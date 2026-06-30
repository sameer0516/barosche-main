import Pendant from './Pendant';
export const metadata = {
  title: "Shop Stylish Minimal & Gemstone Daily-Wear Pendants for Women",
  description:
    "Shop pendants jewellery online with elegant, minimal, and gemstone designs. Perfect for daily wear, gifting, and adding effortless style to any outfit.",
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
    title: "Shop Stylish Minimal & Gemstone Daily-Wear Pendants for Women",
    description:
      "Shop pendants jewellery online with elegant, minimal, and gemstone designs. Perfect for daily wear, gifting, and adding effortless style to any outfit.",
    type: "website",
  },
  icons: {
    icon: "/BaroscheSymbol.png",
  },
};

export default function Page() {
  return <Pendant />;
}