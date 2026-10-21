import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Our approach" };
export default function About() {
  return (
    <main id="main" className="shell about-page">
      <div className="page-heading">
        <span className="eyebrow">THE FORME APPROACH</span>
        <h1>
          Less noise.
          <br />
          More you<span className="orange">.</span>
        </h1>
        <p>Getting dressed should be the easiest part of your day.</p>
      </div>
      <div className="about-grid">
        <div className="about-image">
          <Image
            src="/images/campaign.jpg"
            width={1792}
            height={2400}
            alt="Our everyday look: sand hoodie, charcoal trousers, and neutral sneakers"
            sizes="(max-width: 767px) 100vw, 45vw"
          />
        </div>
        <div className="about-copy">
          <h2>
            In good form.
            <br />
            In your own way.
          </h2>
          <p>
            FORME is a place for the pieces you keep coming back to. The hoodie
            you reach for. The shoes that go with everything. The shape of an
            everyday wardrobe.
          </p>
          <p>
            Our first collection pairs warm neutrals with charcoal and a little
            pumpkin. Simple shapes, easy proportions, and room to make it your
            own.
          </p>
          <Link href="/shop" className="button button-dark">
            Meet the collection ↗
          </Link>
          <div className="about-questions" id="questions">
            <span className="eyebrow">A FEW THINGS TO KNOW</span>
            <details>
              <summary>Can I shop in naira or dollars?</summary>
              <p>
                Yes. Use the NGN/USD selector in the header. Each currency has
                its own configured price; prices are not based on a live
                exchange rate.
              </p>
            </details>
            <details>
              <summary>Is FORME a real clothing store?</summary>
              <p>
                FORME is a non-commercial portfolio concept by Fuhad Adeyanju.
                You can browse, choose sizes, build a bag, and complete a demo
                order. Nothing is sold or shipped, and no payment is collected.
              </p>
            </details>
            <details>
              <summary>What about sizing and returns?</summary>
              <p>
                Sizes are part of the demo experience. This fictional collection
                has no physical inventory, deliveries, or returns. Try the full
                checkout using the prefilled sample details.
              </p>
            </details>
            <details>
              <summary>Where does the photography come from?</summary>
              <p>
                The hero campaign photograph was supplied for this project.
                Additional collection and journal photography comes from Pexels.
                <Link href="/credits"> View the complete image credits ↗</Link>
              </p>
            </details>
          </div>
          <section className="about-project" id="project">
            <span className="eyebrow">DESIGNED. BUILT. CONNECTED.</span>
            <h3>A full-stack portfolio piece.</h3>
            <p>
              The experience pairs a Next.js storefront with a Go API and Neon
              Postgres. Currency choices and the bag stay with you across
              visits; demo orders are validated and saved, while submitted
              contact details are replaced with a fictional identity.
            </p>
            <a
              href="https://github.com/adeyanjufuhad/forme-store"
              className="text-link"
            >
              View the project on GitHub ↗
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
