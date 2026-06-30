import Mens from './Mens';
export const metadata = {
  title: "Shop Luxury Men’s Jewellery & Accessories Online | Barosche",
  description:
    "Shop luxury men’s jewellery & accessories online at Barosche. Elevate your style with bold, modern jewellery designs made for confident, stylish men.",
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
    title: "Shop Luxury Men’s Jewellery & Accessories Online | Barosche",
    description:
      "Shop luxury men’s jewellery & accessories online at Barosche. Elevate your style with bold, modern jewellery designs made for confident, stylish men.",
    type: "website",
  },
  icons: {
    icon: "/BaroscheSymbol.png",
  },
};

export default function Page() {
  return <Mens />;
}