import RingSize from "./ringSize";

export const metadata = {
  title: "Ring Size Chart | Barosche",
  description:
    "Find your perfect ring size with our USA to EU size conversion chart including diameter and circumference measurements.",
  alternates: {
    canonical: "https://barosche.com/find-your-ring-size/",
  },
};

export default function RingSizePage() {
  return (
    <>
      <RingSize />
    </>
  );
}