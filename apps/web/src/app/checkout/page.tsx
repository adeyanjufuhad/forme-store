import type { Metadata } from "next";
import { getCatalog } from "@/lib/api";
import { Checkout } from "@/components/checkout";
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage() {
  const { products, mode } = await getCatalog();
  return (
    <main id="main" className="shell checkout-page">
      <div className="page-heading">
        <span className="eyebrow">ONE STEP CLOSER</span>
        <h1>
          Make it yours<span className="orange">.</span>
        </h1>
      </div>
      <Checkout products={products} mode={mode} />
    </main>
  );
}
