import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <span className="eyebrow">LESS NOISE. MORE YOU.</span>
          <h2>
            Make yourself
            <br />
            at home.
          </h2>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/shop">Shop the collection</Link>
          <Link href="/about">About FORME</Link>
          <Link href="/journal">The journal</Link>
          <Link href="/credits">Project & image credits</Link>
          <Link href="/about#questions">Shopping questions</Link>
          <Link href="/bag">Your bag</Link>
        </nav>
      </div>
      <div className="shell footer-wordmark" aria-hidden="true">
        FORME.
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getUTCFullYear()} FORME / A PORTFOLIO CONCEPT</span>
        <span>CLOTHING & FOOTWEAR / EVERYDAY, IN YOUR OWN FORM.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
