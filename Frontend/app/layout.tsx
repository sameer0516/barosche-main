import type { Metadata } from "next";
import { Rokkitt } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { CartProvider } from "../app/context/CartContext";
import { WishlistProvider } from "../app/context/WishlistContext";
import { LanguageProvider } from "@/lib/languageContext";
import { AuthProvider } from "./context/AuthContext";

const rokkitt = Rokkitt({
  subsets: ["latin"],
  variable: "--font-rokkitt",
});

export const metadata: Metadata = {
  title: {
    default: "Buy Minimalist Luxury, Fine & Diamond Jewellery Online",
    template: "",
  },
  description: "Shop minimalist, fine & diamond jewellery online at Barosche. Discover luxury semi-handcrafted designs, elegant accessories & timeless jewellery pieces.",
  metadataBase: new URL("https://www.barosche.com"),
  openGraph: {
    siteName: "Barosche",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/BaroscheSymbol.png",
  },
  verification: {
    google: "jVAsSeA8nvDbCkpPMq1ZLoSKy0uvwfKBW7kxqI8JP1U",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rokkitt.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className={`${rokkitt.className} min-h-full flex flex-col`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TZQD6H28"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TZQD6H28');`}
        </Script>

        {/* Google Pay */}
        <Script
          src="https://pay.google.com/gp/p/js/pay.js"
          strategy="afterInteractive"
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-70G7DS8Z48"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-70G7DS8Z48');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){
                  (c[a].q=c[a].q||[]).push(arguments)
                };
                t=l.createElement(r);
                t.async=1;
                t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];
                y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x1p1agms4o");
          `}
        </Script>

        {/* Contentsquare */}
        <Script
          src="https://t.contentsquare.net/uxa/7ba3f5e34ad55.js"
          strategy="afterInteractive"
        />

        <LanguageProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Navbar />
                {children}
                <Footer />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}