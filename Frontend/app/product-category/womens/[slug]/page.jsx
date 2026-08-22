import WomensDetailClient from './WomensDetailClient.jsx';
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
    return generateCategoryStaticParams('Womens');
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
    const pageUrl = `${siteUrl}/product-category/womens/${product.slug}`;

    const rawImg = product.images?.length > 0 ? product.images[0] : product.img || '';
    const imageUrl = rawImg.startsWith('http') ? rawImg : `${API_BASE}${rawImg}`;
    const title = `${product.title || product.name} | Barosche Womens`;
    const description = (product.description || '').slice(0, 160);

    return {
        title,
        description,
        keywords: [product.category, 'womens jewellery', 'barosche', 'fine jewellery', 'handcrafted jewellery']
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


function ProductJsonLd({ product }) {
    const pageUrl = `${SITE_URL}/product-category/womens/${product.slug}/`;

    // Handle single or multiple images
    const rawImages = product.images?.length > 0
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

    const currency = product.currency || 'INR';

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
                category: 'Jewellery > Womens',
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
                        value: 'Eco-conscious, fully paper-based packaging suitable for gifting',
                    },
                    {
                        '@type': 'PropertyValue',
                        name: 'Care Instructions',
                        value:
                            'Avoid contact with perfumes, lotions and chemicals. Clean gently with a soft cloth after use and store in a dry pouch or box away from sunlight.',
                    },
                ].filter(Boolean),
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: String(product.rating || 4.5),
                    reviewCount: String(product.reviewCount || 2),
                },
                offers: {
                    '@type': 'Offer',
                    '@id': `${pageUrl}#offer`,
                    url: pageUrl,
                    price: parsedPrice.toFixed(2),
                    priceCurrency: currency,
                    priceValidUntil: new Date(
                        new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                        .toISOString()
                        .split('T')[0],
                    availability: product.inStock
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    sku: product.sku || product._id,
                    seller: {
                        '@type': 'Organization',
                        name: 'Barosche',
                        url: `${SITE_URL}/`,
                        logo: `${SITE_URL}/logo.png`,
                    },
                    priceSpecification,
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
                        name: 'Womens',
                        item: `${SITE_URL}/product-category/womens/`,
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

export default async function JewelleryDetailPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    return (
        <>
            {product && <ProductJsonLd product={product} />}
            <WomensDetailClient slug={slug} />
        </>
    );
}