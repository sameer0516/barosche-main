import GirlfriendDetailClient from './GirlfriendDetailClient.jsx';
import { generateCategoryStaticParams } from '../../staticParamsHelper.js';

const API_BASE = "https://api.barosche.com";
const SITE_URL = "https://barosche.com";
const CATEGORY_NAME = "Jewellery";
const CATEGORY_SLUG = "jewellery";

async function getProduct(slug) {
    try {
        const res = await fetch(`${API_BASE}/api/products/${slug}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.product : null;
    } catch {
        return null;
    }
}

export async function generateStaticParams() {
    return generateCategoryStaticParams('Jewellery');
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Barosche',
            description: 'This product could not be found.',
        };
    }

    const siteUrl = 'https://barosche.com';
    const pageUrl = `${siteUrl}/product-category/jewellery/${product.slug}`;

    const rawImg = product.images?.length > 0 ? product.images[0] : product.img || '';
    const imageUrl = rawImg.startsWith('http') ? rawImg : `${API_BASE}${rawImg}`;
    const title = `${product.title || product.name} | Barosche Jewellery`;
    const description = (product.description || '').slice(0, 160);

    return {
        title,
        description,
        keywords: [product.category, 'jewellery', 'barosche', 'fine jewellery', 'handcrafted jewellery']
            .filter(Boolean).join(', '),
        alternates: { canonical: pageUrl },
        openGraph: {
            title, description, url: pageUrl,
            siteName: 'Barosche Fine Jewellery',
            images: imageUrl ? [{ url: imageUrl, width: 800, height: 1000, alt: product.title || product.name }] : [],
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image', title, description,
            images: imageUrl ? [imageUrl] : [],
            site: '@barosche',
        },
        robots: {
            index: true, follow: true,
            googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    };
}

// ─────────────────────────────────────────────────────────
//  JSON-LD SCHEMA — built dynamically from live product data
// ─────────────────────────────────────────────────────────
function ProductJsonLd({ product }) {
    const pageUrl = `${SITE_URL}/product-category/${CATEGORY_SLUG}/${product.slug}/`;

    const toAbsolute = (img) => (img && img.startsWith('http') ? img : `${API_BASE}${img || ''}`);

    const allImages = (product.images && product.images.length > 0 ? product.images : [product.img])
        .filter(Boolean)
        .map(toAbsolute);

    const primaryImage = allImages[0] || `${SITE_URL}/logo.png`;

    const price = product.newPrice ?? product.price ?? 0;
    const oldPrice = product.oldPrice ?? null;
    const productName = product.title || product.name || '';

    const materials = Array.isArray(product.materials) && product.materials.length > 0
        ? product.materials
        : (product.material ? [product.material] : []);

    const gemstoneValue = Array.isArray(product.gemstones) && product.gemstones.length > 0
        ? product.gemstones.join(', ')
        : (product.gemstone || '');

    // ── 1. WebPage schema ──
    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": `${productName} | Barosche`,
        "description": (product.description || '').slice(0, 300),
        "inLanguage": "en",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "mainEntity": { "@id": `${pageUrl}#product` },
        "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
        "primaryImageOfPage": { "@id": `${pageUrl}#primaryimage` },
        "publisher": { "@id": `${SITE_URL}/#organization` },
    };

    // ── 2. ImageObject schema ──
    const imageObjectSchema = {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "@id": `${pageUrl}#primaryimage`,
        "url": primaryImage,
        "contentUrl": primaryImage,
        "caption": `${productName}${materials.length ? ' in ' + materials.join(', ') : ''}`,
        "representativeOfPage": true,
    };

    const productGraphSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "@id": `${pageUrl}#product`,
                "name": productName,
                "url": pageUrl,
                "description": product.description || '',
                "image": allImages,
                "sku": product.sku || product._id,
                ...(product.color ? { "color": product.color } : {}),
                ...(product.size ? { "size": product.size } : {}),
                "category": `Jewellery > ${product.category || CATEGORY_NAME}`,
                ...(materials.length > 0 ? { "material": materials } : {}),
                "brand": {
                    "@type": "Brand",
                    "name": "Barosche",
                    "logo": `${SITE_URL}/logo.png`,
                },
                "additionalProperty": [
                    gemstoneValue
                        ? { "@type": "PropertyValue", "name": "Gemstone", "value": gemstoneValue }
                        : null,
                    {
                        "@type": "PropertyValue",
                        "name": "Packaging",
                        "value": "Eco-conscious, fully paper-based packaging suitable for gifting",
                    },
                    {
                        "@type": "PropertyValue",
                        "name": "Care Instructions",
                        "value": "Avoid contact with perfumes, lotions and chemicals. Clean gently with a soft cloth after use and store in a dry pouch or box away from sunlight.",
                    },
                ].filter(Boolean),
                "offers": {
                    "@type": "Offer",
                    "@id": `${pageUrl}#offer`,
                    "url": pageUrl,
                    "price": String(price),
                    "priceCurrency": "EUR",
                    "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "itemCondition": "https://schema.org/NewCondition",
                    "sku": product.sku || product._id,
                    "seller": {
                        "@type": "Organization",
                        "name": "Barosche GbR",
                        "url": `${SITE_URL}/`,
                        "logo": `${SITE_URL}/logo.png`,
                    },
                    "priceSpecification": [
                        {
                            "@type": "UnitPriceSpecification",
                            "price": String(price),
                            "priceCurrency": "EUR",
                            "valueAddedTaxIncluded": true,
                        },
                        ...(oldPrice
                            ? [{
                                "@type": "UnitPriceSpecification",
                                "price": String(oldPrice),
                                "priceCurrency": "EUR",
                                "priceType": "https://schema.org/StrikethroughPrice",
                                "valueAddedTaxIncluded": true,
                            }]
                            : []),
                    ],
                    "warranty": {
                        "@type": "WarrantyPromise",
                        "description": "365-day warranty against manufacturing defects",
                        "durationOfWarranty": { "@type": "QuantitativeValue", "value": 365, "unitCode": "DAY" },
                    },
                    "shippingDetails": [
                        {
                            "@type": "OfferShippingDetails",
                            "name": "Standard Delivery in Germany",
                            "shippingRate": { "@type": "MonetaryAmount", "value": "0.00", "currency": "EUR" },
                            "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "DE" },
                            "deliveryTime": {
                                "@type": "ShippingDeliveryTime",
                                "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 4, "unitCode": "DAY" },
                            },
                        },
                        {
                            "@type": "OfferShippingDetails",
                            "name": "Standard Delivery to EU Countries",
                            "shippingRate": { "@type": "MonetaryAmount", "value": "0.00", "currency": "EUR" },
                            "shippingDestination": {
                                "@type": "DefinedRegion",
                                "addressCountry": ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"],
                            },
                            "deliveryTime": {
                                "@type": "ShippingDeliveryTime",
                                "transitTime": { "@type": "QuantitativeValue", "minValue": 4, "maxValue": 8, "unitCode": "DAY" },
                            },
                        },
                        {
                            "@type": "OfferShippingDetails",
                            "name": "Express Delivery in Germany",
                            "shippingRate": { "@type": "MonetaryAmount", "value": "50.00", "currency": "EUR" },
                            "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "DE" },
                            "deliveryTime": {
                                "@type": "ShippingDeliveryTime",
                                "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 3, "unitCode": "DAY" },
                            },
                        },
                        {
                            "@type": "OfferShippingDetails",
                            "name": "Express Delivery to EU Countries",
                            "shippingRate": { "@type": "MonetaryAmount", "value": "50.00", "currency": "EUR" },
                            "shippingDestination": {
                                "@type": "DefinedRegion",
                                "addressCountry": ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"],
                            },
                            "deliveryTime": {
                                "@type": "ShippingDeliveryTime",
                                "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 4, "unitCode": "DAY" },
                            },
                        },
                    ],
                    "hasMerchantReturnPolicy": {
                        "@type": "MerchantReturnPolicy",
                        "merchantReturnLink": `${SITE_URL}/return-cancellation-policy`,
                        "applicableCountry": ["DE", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"],
                        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                        "merchantReturnDays": 30,
                        "returnFees": "https://schema.org/FreeReturn",
                        "itemCondition": "https://schema.org/NewCondition",
                    },
                },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumb`,
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
                    { "@type": "ListItem", "position": 2, "name": CATEGORY_NAME, "item": `${SITE_URL}/product-category/${CATEGORY_SLUG}/` },
                    { "@type": "ListItem", "position": 3, "name": productName, "item": pageUrl },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productGraphSchema) }}
            />
        </>
    );
}

export default async function GirlfriendDetailPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    return (
        <>
            {product && <ProductJsonLd product={product} />}
            <GirlfriendDetailClient slug={slug} />
        </>
    );
}