import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
export const metadata: Metadata = { title: "Shop the collection" };
export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const { products } = await getCatalog();
  const categories = ["All pieces", "Clothing", "Footwear", "Accessories"];
  const category = categories.includes(params.category || "")
    ? params.category!
    : "All pieces";
  const query = (params.q || "").trim().slice(0, 120);
  const sort = params.sort || "featured";
  let visible = products.filter(
    (p) =>
      (category === "All pieces" || p.category === category) &&
      `${p.name} ${p.color} ${p.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  // Alphabetic ordering remains stable when the shopper changes currencies.
  if (sort === "name")
    visible = [...visible].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <main id="main" className="shop-page shell">
      <div className="page-heading">
        <span className="eyebrow">THE FORME COLLECTION</span>
        <h1>
          Your everyday.
          <br />
          In good form<span className="orange">.</span>
        </h1>
        <p>Considered pieces. Easy combinations. All you.</p>
      </div>
      <div className="shop-toolbar">
        <nav aria-label="Product categories" className="category-filters">
          {categories.map((c) => {
            const search = new URLSearchParams();
            if (c !== "All pieces") search.set("category", c);
            if (query) search.set("q", query);
            if (sort !== "featured") search.set("sort", sort);
            return (
              <Link
                key={c}
                href={`/shop?${search}`}
                className={c === category ? "active" : ""}
                aria-current={c === category ? "page" : undefined}
              >
                {c}
              </Link>
            );
          })}
        </nav>
        <span className="eyebrow">{visible.length} PIECES</span>
      </div>
      <form action="/shop" className="search-form" id="search">
        <label className="sr-only" htmlFor="q">
          Search the collection
        </label>
        <input
          id="q"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Find a piece, color, or category…"
          defaultValue={query}
        />
        {category !== "All pieces" && (
          <input type="hidden" name="category" value={category} />
        )}
        <label className="sr-only" htmlFor="sort">
          Sort products
        </label>
        <select id="sort" name="sort" defaultValue={sort}>
          <option value="featured">Featured</option>
          <option value="name">Name: A–Z</option>
        </select>
        <button type="submit" className="button button-dark">
          Search <span aria-hidden>↗</span>
        </button>
      </form>
      {visible.length ? (
        <div className="product-grid shop-grid">
          {visible.map((p, index) => (
            <ProductCard product={p} index={index} key={p.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No pieces found.</h2>
          <p>Try a different search or explore the full collection.</p>
          <Link href="/shop" className="text-link">
            View all pieces ↗
          </Link>
        </div>
      )}
      <p className="catalog-caption">
        A fictional collection for a portfolio project. Photography credits are
        available in the footer.
      </p>
    </main>
  );
}
