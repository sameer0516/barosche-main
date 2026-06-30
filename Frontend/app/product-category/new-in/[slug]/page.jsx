// app/product-category/new-in/[slug]/page.jsx

import NewInDetailClient from './newInDetailClient.jsx';

const API_BASE = "https://api.barosche.com";

// ── REQUIRED for output: export ──
export const dynamicParams = false;

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
    try {
        const [res1, res2] = await Promise.all([
            fetch(`${API_BASE}/api/products?category=${encodeURIComponent('New In')}`, { cache: 'no-store' }),
            fetch(`${API_BASE}/api/products?category=${encodeURIComponent('New')}`, { cache: 'no-store' }),
        ]);

        const [data1, data2] = await Promise.all([
            res1.ok ? res1.json() : { success: false },
            res2.ok ? res2.json() : { success: false },
        ]);

        const products = [
            ...(data1.success ? data1.products || [] : []),
            ...(data2.success ? data2.products || [] : []),
        ];

        const seen = new Set();
        const unique = products.filter(p => {
            if (!p.slug || seen.has(p.slug)) return false;
            seen.add(p.slug);
            return true;
        });

        console.log('[new-in] generateStaticParams slugs:', unique.map(p => p.slug));

        return unique.length > 0
            ? unique.map(p => ({ slug: p.slug }))
            : [{ slug: 'placeholder' }];
    } catch (e) {
        console.error('[new-in] generateStaticParams error:', e);
        return [{ slug: 'placeholder' }];
    }
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
    const pageUrl = `${siteUrl}/product-category/new-in/${product.slug}`;
    const rawImg = product.images?.length > 0 ? product.images[0] : product.img || '';
    const imageUrl = rawImg.startsWith('http') ? rawImg : `${API_BASE}${rawImg}`;
    const title = `${product.title || product.name} | Barosche New In`;
    const description = (product.description || '').slice(0, 160);

    return {
        title,
        description,
        keywords: [product.category, 'new in', 'barosche', 'fine jewellery', 'new arrivals', 'handcrafted jewellery']
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
    const siteUrl = 'https://barosche.com';
    const pageUrl = `${siteUrl}/product-category/new-in/${product.slug}`;
    const rawImg = product.images?.length > 0 ? product.images[0] : product.img || '';
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
            priceCurrency: 'EUR',
            price: typeof price === 'string' ? parseFloat(price.replace('€', '')) : price,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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

export default async function NewInDetailPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    return (
        <>
            {product && <ProductJsonLd product={product} />}
            <NewInDetailClient slug={slug} />
        </>
    );
}