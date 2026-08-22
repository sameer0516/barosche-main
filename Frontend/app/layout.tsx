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
import { CurrencyProvider } from "./context/CurrencyContext";
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
  metadataBase: new URL("https://barosche.com"),
  openGraph: {
  title: "Buy Minimalist Luxury, Fine & Diamond Jewellery Online",
  description:
    "Shop minimalist, fine & diamond jewellery online at Barosche. Discover luxury semi-handcrafted designs, elegant accessories & timeless jewellery pieces.",
  url: "https://barosche.com",
  siteName: "Barosche",
  locale: "en_IN",
  type: "website",
  images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Barosche",
      },
    ],
  },
   twitter: {
   card: "summary_large_image",
   title: "Buy Minimalist Luxury, Fine & Diamond Jewellery Online",
   description:
    "Shop minimalist, fine & diamond jewellery online at Barosche. Discover luxury semi-handcrafted designs, elegant accessories & timeless jewellery pieces.",
   images: ["/logo.png"],
  },

  icons: {
    icon: "/BaroscheSymbol.png",
  },
  verification: {
    google: "jVAsSeA8nvDbCkpPMq1ZLoSKy0uvwfKBW7kxqI8JP1U",
  },
};

// Organization Schema (site-wide)
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://barosche.com/#organization",
  name: "Barosche",
  url: "https://barosche.com/",
  logo: {
    "@type": "ImageObject",
    url: "https://barosche.com/logo.png",
  },
  sameAs: [
    "https://www.instagram.com/baroscheofficial/",
    "https://in.pinterest.com/barosche/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+49 1628806158",
    contactType: "customer service",
    email: "info@barosche.com",
    areaServed: "Worldwide",
    availableLanguage: ["English"],
  },
};

// Website Schema (site-wide)
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://barosche.com/#website",
  url: "https://barosche.com/",
  name: "Barosche",
  publisher: {
    "@id": "https://barosche.com/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://barosche.com/?s={search_term_string}",
    "query-input": "required name=search_term_string",
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
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        {/* Google Tag Manager (2nd container) */}
        <Script id="google-tag-manager-2" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NMG3WQMS');`}
        </Script>
      </head>
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

        {/* Google Tag Manager 2 (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NMG3WQMS"
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

        {/* Facebook Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1898059411093555');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height={1}
            width={1}
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1898059411093555&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <LanguageProvider>
          <CurrencyProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Navbar />
                {children}
                <Footer />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
           </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}