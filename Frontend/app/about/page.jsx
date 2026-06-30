import AboutPage from "./AboutPage";

export const metadata = {
  title: "About Barosche | Minimalist Luxury Jewellery Brand",
  description:
    "Learn about Barosche – a modern jewellery brand crafting minimalist, elegant, and timeless pieces designed for individuality and everyday luxury.",
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
    title: "About Barosche | Minimalist Luxury Jewellery Brand",
    description:
      "Learn about Barosche – a modern jewellery brand crafting minimalist, elegant, and timeless pieces designed for individuality and everyday luxury.",
    type: "website",
  },
  icons: {
    icon: "/BaroscheSymbol.png",
  },
};

export default function Page() {
  return <AboutPage />;
}