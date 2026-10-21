import type { Metadata } from "next";
import { getCatalog } from "@/lib/api";
import { Bag } from "@/components/bag";
export const metadata: Metadata = { title: "Your bag" };
export default async function BagPage() {
  const { products } = await getCatalog();
  return (
    <main id="main" className="shell bag-page">
      <div className="page-heading">
        <span className="eyebrow">CONSIDER IT YOURS. ALMOST.</span>
        <h1>
          Your bag<span className="orange">.</span>
        </h1>
      </div>
      <Bag products={products} />
    </main>
  );
}
