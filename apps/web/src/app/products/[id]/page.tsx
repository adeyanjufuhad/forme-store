import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/api";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { products } = await getCatalog();
  const p = products.find((p) => p.id === id);
  return { title: p?.name || "Piece not found" };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { products } = await getCatalog();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <main id="main" className="shell product-page">
      <ProductDetail product={product} />
      <section className="related-section">
        <div className="section-heading">
          <h2>
            Good together<span className="orange">.</span>
          </h2>
          <span className="eyebrow">BUILD YOUR EVERYDAY</span>
        </div>
        <div className="product-grid">
          {products
            .filter((p) => p.id !== id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
        </div>
      </section>
    </main>
  );
}
