import Link from "next/link";
import "./sitemap.css";

const sitemapData = [
  {
    heading: "HOME",
    links: [
      { label: "Home", href: "/" },
      { label: "About US", href: "/about/" },
      { label: "Our Services", href: "/our-services/" },
      { label: "Size Guide", href: "/size-guide/" },
      { label: "Guides", href: "/guide/" },
      { label: "Blogs", href: "/blogs/" },
      { label: "FAQs", href: "/frequently-asked-questions/" },
    ],
  },
  {
    heading: "SHOP",
    links: [
      { label: "Earrings", href: "/product-category/earrings" },
      { label: "Rings", href: "/product-category/rings" },
      { label: "Jewellery", href: "/jewellery/" },
      { label: "Pendants", href: "/product-category/pendants" },
      { label: "For Today", href: "/product-category/for-today-jewellery/" },
      { label: "Bracelets", href: "/product-category/bracelets" },
      { label: "Men's", href: "/product-category/mens" },
      { label: "Womens", href: "/product-category/womens/" },
      { label: "Chosen", href: "/product-category/chosen-jewellery/" },
      { label: "New In", href: "/product-category/new-in/" },
      { label: "Shop", href: "/shop/" },
      { label: "Jewellery Gifts For Her", href: "/product-category/jewellery-gifts-for-her/" },
      { label: "Christmas Jewellery Gifts", href: "/product-category/christmas-jewellery-gifts/" },
      { label: "Valentine Jewellery Gifts", href: "/product-category/valentine-jewellery-gifts/" },
      { label: "Gold Jewellery Gifts", href: "/product-category/gold-jewellery-gifts/" },
      { label: "Luxury Jewellery Gifts", href: "/product-category/luxury-jewellery-gifts/" },
      { label: "Jewellery Gifts For Girlfriend", href: "/product-category/jewellery-gifts-for-girlfriend/" },
      { label: "Gifts For Her", href: "/product-category/gifts-for-her/" },
      { label: "Minimalist Dainty Jewellery Gifts", href: "/product-category/minimalist-dainty-jewellery-gifts/" },
      
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "Imprint", href: "/imprint/" },
      { label: "Contact-us", href: "/contact-us/" },
      { label: "Shipping Information", href: "/shipping/" },
      { label: "Return & Cancellation Policy", href: "/return-cancellation-policy/" },
      { label: "Sourcing & Manufacturing", href: "/sourcing-manufacturing/" },
      { label: "Privacy policy", href: "/privacy-policy/" },
      { label: "Terms of Service", href: "/terms-of-service/" },
    ],
  },
];

export default function SitemapList() {
  return (
    <div className="sitemap-page">
      <div className="sitemap-hero">
        <div className="sitemap-hero-overlay">
          <h1>SITEMAP</h1>
        </div>
      </div>

      <div className="sitemap-content">
        {sitemapData.map((section) => (
          <div className="sitemap-column" key={section.heading}>
            <h2 className="sitemap-heading">{section.heading}</h2>
            <ul>
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}