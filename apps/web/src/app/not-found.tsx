import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="shell empty-page">
      <span className="eyebrow">404 / OFF THE RACK</span>
      <h1>This piece isn’t here.</h1>
      <p>Find something that feels like you in the collection.</p>
      <Link href="/shop" className="button button-dark">
        Back to the collection ↗
      </Link>
    </main>
  );
}
