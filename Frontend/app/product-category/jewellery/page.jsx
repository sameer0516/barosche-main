import Jewellery from './Jewellery';
export const metadata = {
    title: "Buy Semi-Precious Gemstone & Gold Fashion Jewellery Online",
    description:
        "Shop semi-precious gemstone & gold fashion jewellery online at Barosche. Discover elegant designs in fine silver, gold jewellery & modern accessories.",
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
        title: "Buy Semi-Precious Gemstone & Gold Fashion Jewellery Online",
        description:
            "Shop semi-precious gemstone & gold fashion jewellery online at Barosche. Discover elegant designs in fine silver, gold jewellery & modern accessories.",
        type: "website",
    },
    icons: {
    icon: "/BaroscheSymbol.png",
  },
};

export default function Page() {
    return <Jewellery />;
}