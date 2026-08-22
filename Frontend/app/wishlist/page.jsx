import WishlistClient from "./wishlist";

export const metadata = {
  title: "Wishlist | Save Your Favourite Jewellery | BAROSCHE",
  description: "Save your favourite jewellery pieces to your BAROSCHE wishlist and easily revisit your selected rings, earrings, pendants and bracelets whenever you're ready.",
  alternates: {
    canonical: "https://barosche.com/wishlist/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <WishlistClient />;
}