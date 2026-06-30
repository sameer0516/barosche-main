// app/product-category/rings/[slug]/page.jsx

import EarringDetailClient from './EarringDetailClient.jsx';
import { generateCategoryStaticParams } from '../../staticParamsHelper.js';

const API_BASE = "https://api.barosche.com";

// ── Fetch single product from backend ──
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
    return generateCategoryStaticParams('Earrings');
}

// ── Dynamic Metadata ──
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
    const pageUrl = `${siteUrl}/product-category/earrings/${product.slug}`;

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

// ── JSON-LD Schema ──
function ProductJsonLd({ product }) {
    const siteUrl = 'https://barosche.com';
    const pageUrl = `${siteUrl}/product-category/earrings/${product.slug}`;

    const rawImg =
        product.images && product.images.length > 0
            ? product.images[0]
            : product.img || '';
    const imageUrl = rawImg.startsWith('http') ? rawImg : `${API_BASE}${rawImg}`;

    const price = product.newPrice ?? product.price ?? 0;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title || product.name,
        description: product.description || '',
        image: imageUrl,
        sku: product.sku || product._id,
        url: pageUrl,
        brand: { '@type': 'Brand', name: 'Barosche' },
        material: product.material,
        offers: {
            '@type': 'Offer',
            url: pageUrl,
            priceCurrency: 'INR',
            price: typeof price === 'string' ? parseFloat(price.replace('€', '')) : price,
            priceValidUntil: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
            )
                .toISOString()
                .split('T')[0],
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Barosche' },
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(product.rating || 4.5),
            reviewCount: String(product.reviewCount || 2),
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// ── Page Component ──
export default async function EarringDetailPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    return (
        <>
            {product && <ProductJsonLd product={product} />}
            <EarringDetailClient slug={slug} />
        </>
    );
}