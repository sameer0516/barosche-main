
import PendantDetailClient from './pendantDetailClient.jsx';
import { generateCategoryStaticParams } from '../../staticParamsHelper.js';

const API_BASE = "https://api.barosche.com";
const SITE_URL = "https://barosche.com";

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
    return generateCategoryStaticParams('Pendants');
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

    const pageUrl = `${SITE_URL}/product-category/rings/${product.slug}`;

    const rawImg =
        product.images && product.images.length > 0
            ? product.images[0]
            : product.img || '';
    const imageUrl = rawImg.startsWith('http') ? rawImg : `${API_BASE}${rawImg}`;

    const title = `${product.title || product.name} | Barosche Rings`;
    const description = (product.description || '').slice(0, 160);

    return {
        title,
        description,
        keywords: [
            product.category,
            'rings',
            'barosche',
            'fine jewellery',
            'statement rings',
            'handcrafted jewellery',
        ]
            .filter(Boolean)
            .join(', '),

        alternates: { canonical: pageUrl },

        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: 'Barosche Fine Jewellery',
            images: imageUrl
                ? [{ url: imageUrl, width: 800, height: 1000, alt: product.title || product.name }]
                : [],
            locale: 'en_IE',
            type: 'website',
        },

        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
            site: '@barosche',
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

// ── Full JSON-LD Schema (WebPage + ImageObject + Product/Offer/Breadcrumb) ──
function ProductJsonLd({ product }) {
    const pageUrl = `${SITE_URL}/product-category/rings/${product.slug}/`;

    // Handle single or multiple images
    const rawImages =
        product.images && product.images.length > 0
            ? product.images
            : product.img
                ? [product.img]
                : [];
    const imageUrls = rawImages.map((img) =>
        img.startsWith('http') ? img : `${API_BASE}${img}`
    );
    const primaryImage = imageUrls[0] || '';

    const title = product.title || product.name;
    const description = product.description || '';

    const price = product.newPrice ?? product.price ?? 0;
    const parsedPrice =
        typeof price === 'string' ? parseFloat(price.replace(/[€₹]/g, '')) : price;

    const originalPrice = product.oldPrice ?? product.originalPrice ?? null;
    const parsedOriginalPrice =
        originalPrice != null
            ? typeof originalPrice === 'string'
                ? parseFloat(originalPrice.replace(/[€₹]/g, ''))
                : originalPrice
            : null;

    const currency = product.currency || 'EUR';

    const materials = Array.isArray(product.material)
        ? product.material
        : product.material
            ? [product.material]
            : [];

    // ── WebPage Schema ──
    const webPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${title} | Barosche`,
        description: description.slice(0, 160),
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${pageUrl}#product` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        primaryImageOfPage: { '@id': `${pageUrl}#primaryimage` },
        publisher: { '@id': `${SITE_URL}/#organization` },
    };

    // ── ImageObject Schema ──
    const imageObjectSchema = primaryImage
        ? {
              '@context': 'https://schema.org',
              '@type': 'ImageObject',
              '@id': `${pageUrl}#primaryimage`,
              url: primaryImage,
              contentUrl: primaryImage,
              caption: title,
              representativeOfPage: true,
          }
        : null;

    // ── Product + Offer + Breadcrumb Schema (@graph) ──
    const priceSpecification = [
        {
            '@type': 'UnitPriceSpecification',
            price: parsedPrice.toFixed(2),
            priceCurrency: currency,
            valueAddedTaxIncluded: true,
        },
    ];

    if (parsedOriginalPrice && parsedOriginalPrice > parsedPrice) {
        priceSpecification.push({
            '@type': 'UnitPriceSpecification',
            price: parsedOriginalPrice.toFixed(2),
            priceCurrency: currency,
            priceType: 'https://schema.org/StrikethroughPrice',
            valueAddedTaxIncluded: true,
        });
    }

    const productSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                '@id': `${pageUrl}#product`,
                name: title,
                url: pageUrl,
                description: description,
                image: imageUrls,
                sku: product.sku || product._id,
                color: product.color || undefined,
                size: product.size || undefined,
                category: `Jewellery > Rings`,
                material: materials.length ? materials : undefined,
                brand: {
                    '@type': 'Brand',
                    name: 'Barosche',
                    logo: `${SITE_URL}/logo.png`,
                },
                additionalProperty: [
                    materials.length
                        ? {
                              '@type': 'PropertyValue',
                              name: 'Material',
                              value: materials.join(', '),
                          }
                        : null,
                    {
                        '@type': 'PropertyValue',
                        name: 'Packaging',
                        value:
                            'Eco-conscious, fully paper-based packaging suitable for gifting',
                    },
                    {
                        '@type': 'PropertyValue',
                        name: 'Care Instructions',
                        value:
                            'Avoid contact with perfumes, lotions and chemicals. Clean gently with a soft cloth after use and store in a dry pouch or box away from sunlight.',
                    },
                ].filter(Boolean),
                offers: {
                    '@type': 'Offer',
                    '@id': `${pageUrl}#offer`,
                    url: pageUrl,
                    price: parsedPrice.toFixed(2),
                    priceCurrency: currency,
                    availability: product.inStock
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    sku: product.sku || product._id,
                    seller: {
                        '@type': 'Organization',
                        name: 'Barosche GbR',
                        url: `${SITE_URL}/`,
                        logo: `${SITE_URL}/logo.png`,
                    },
                    priceSpecification,
                    warranty: {
                        '@type': 'WarrantyPromise',
                        description: '365-day warranty against manufacturing defects',
                        durationOfWarranty: {
                            '@type': 'QuantitativeValue',
                            value: 365,
                            unitCode: 'DAY',
                        },
                    },
                    shippingDetails: [
                        {
                            '@type': 'OfferShippingDetails',
                            name: 'Standard Delivery in Germany',
                            shippingRate: {
                                '@type': 'MonetaryAmount',
                                value: '0.00',
                                currency,
                            },
                            shippingDestination: {
                                '@type': 'DefinedRegion',
                                addressCountry: 'DE',
                            },
                            deliveryTime: {
                                '@type': 'ShippingDeliveryTime',
                                transitTime: {
                                    '@type': 'QuantitativeValue',
                                    minValue: 2,
                                    maxValue: 4,
                                    unitCode: 'DAY',
                                },
                            },
                        },
                        {
                            '@type': 'OfferShippingDetails',
                            name: 'Standard Delivery to EU Countries',
                            shippingRate: {
                                '@type': 'MonetaryAmount',
                                value: '0.00',
                                currency,
                            },
                            shippingDestination: {
                                '@type': 'DefinedRegion',
                                addressCountry: [
                                    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI',
                                    'FR', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT',
                                    'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
                                ],
                            },
                            deliveryTime: {
                                '@type': 'ShippingDeliveryTime',
                                transitTime: {
                                    '@type': 'QuantitativeValue',
                                    minValue: 4,
                                    maxValue: 8,
                                    unitCode: 'DAY',
                                },
                            },
                        },
                        {
                            '@type': 'OfferShippingDetails',
                            name: 'Express Delivery in Germany',
                            shippingRate: {
                                '@type': 'MonetaryAmount',
                                value: '50.00',
                                currency,
                            },
                            shippingDestination: {
                                '@type': 'DefinedRegion',
                                addressCountry: 'DE',
                            },
                            deliveryTime: {
                                '@type': 'ShippingDeliveryTime',
                                transitTime: {
                                    '@type': 'QuantitativeValue',
                                    minValue: 2,
                                    maxValue: 3,
                                    unitCode: 'DAY',
                                },
                            },
                        },
                        {
                            '@type': 'OfferShippingDetails',
                            name: 'Express Delivery to EU Countries',
                            shippingRate: {
                                '@type': 'MonetaryAmount',
                                value: '50.00',
                                currency,
                            },
                            shippingDestination: {
                                '@type': 'DefinedRegion',
                                addressCountry: [
                                    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI',
                                    'FR', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT',
                                    'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
                                ],
                            },
                            deliveryTime: {
                                '@type': 'ShippingDeliveryTime',
                                transitTime: {
                                    '@type': 'QuantitativeValue',
                                    minValue: 2,
                                    maxValue: 4,
                                    unitCode: 'DAY',
                                },
                            },
                        },
                    ],
                    hasMerchantReturnPolicy: {
                        '@type': 'MerchantReturnPolicy',
                        merchantReturnLink: `${SITE_URL}/return-cancellation-policy`,
                        applicableCountry: [
                            'DE', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI',
                            'FR', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
                            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
                        ],
                        returnPolicyCategory:
                            'https://schema.org/MerchantReturnFiniteReturnWindow',
                        merchantReturnDays: 30,
                        returnFees: 'https://schema.org/FreeReturn',
                        itemCondition: 'https://schema.org/NewCondition',
                    },
                },
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${pageUrl}#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: `${SITE_URL}/`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Rings',
                        item: `${SITE_URL}/product-category/rings/`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: title,
                        item: pageUrl,
                    },
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
            {imageObjectSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectSchema) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
        </>
    );
}

// ── Page Component ──
export default async function pendantDetailPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    return (
        <>
            {product && <ProductJsonLd product={product} />}
            <PendantDetailClient slug={slug} />
        </>
    );
}