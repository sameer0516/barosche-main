// app/product-category/staticParamsHelper.js

const API_BASE = "https://api.barosche.com";

export async function generateCategoryStaticParams(category) {
    try {
        const res = await fetch(
            `${API_BASE}/api/products?category=${encodeURIComponent(category)}`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) return [{ slug: 'placeholder' }];
        const data = await res.json();
        if (!data.success || !data.products?.length) return [{ slug: 'placeholder' }];
        return data.products
            .filter((p) => p.slug)
            .map((p) => ({ slug: p.slug }));
    } catch {
        return [{ slug: 'placeholder' }];
    }
}