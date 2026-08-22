import Home from "@/components/Home/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://barosche.com/",
  },
};

export default function Page() {
  return <Home />;
}