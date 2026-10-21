export default function Loading() {
  return (
    <main
      id="main"
      className="shell loading-page"
      aria-label="Loading collection"
      aria-busy="true"
    >
      <div className="skeleton skeleton-title" />
      <div className="product-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="skeleton skeleton-product" key={i} />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading collection…
      </span>
    </main>
  );
}
