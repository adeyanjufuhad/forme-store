import Image from "next/image";
import Link from "next/link";
import { getCatalog } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { MotionBand } from "@/components/motion-band";
import { JournalSection } from "@/components/journal-section";
import { KineticShapes } from "@/components/kinetic-shapes";
import { Rotation } from "@/components/rotation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string }>;
}) {
  const params = await searchParams;
  const { products } = await getCatalog();
  return (
    <main id="main">
      <section className="campaign" aria-labelledby="campaign-title">
        <div className="campaign-copy">
          <KineticShapes />
          <div className="campaign-top eyebrow">
            <span>THE EVERYDAY EDIT</span>
            <span>COLLECTION / 01</span>
          </div>
          <span className="campaign-number" aria-hidden>
            01
          </span>
          <h1 id="campaign-title">
            <span className="hero-line">
              <span>FIND</span>
            </span>
            <span className="hero-line">
              <span>YOUR</span>
            </span>
            <span className="hero-line">
              <span>FORM.</span>
            </span>
          </h1>
          <div className="campaign-bottom">
            <p>
              Good clothes. Better days.
              <br />
              Made for the way you move.
            </p>
            <Link href="/shop" className="button button-dark">
              Shop the collection <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
        <div className="campaign-photo">
          <KineticShapes variant="photo" />
          <Image
            src="/images/campaign.jpg"
            alt="The FORME everyday look: a seated man wearing a sand hoodie, charcoal trousers, cap, and beige high-top sneakers"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="campaign-person"
          />
          <span className="photo-caption eyebrow">IN YOUR OWN FORM.</span>
          <div className="photo-label">
            <span className="eyebrow">LOOK NO. 01</span>
            <span>Easy does it.</span>
            <Link
              href="/products/daily-hoodie"
              aria-label="Shop The Daily Hoodie"
            >
              ↗
            </Link>
          </div>
        </div>
      </section>
      <div className="editorial-strip shell">
        <span className="eyebrow">
          NOTHING EXTRA.
          <br />
          JUST THE GOOD STUFF.
        </span>
        <p>
          Wear it your way.
          <br />
          <span>Then wear it again.</span>
        </p>
        <span className="strip-arrow" aria-hidden>
          ↙
        </span>
      </div>
      <section className="collection shell" aria-labelledby="collection-title">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR NEW ROTATION / 01—04</span>
              <h2 id="collection-title">
                Everyday favorites<span className="orange">.</span>
              </h2>
            </div>
            <Link href="/shop" className="text-link">
              Shop all pieces <span aria-hidden>↗</span>
            </Link>
          </div>
          <Reveal className="product-grid" stagger={0.12}>
            {products.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </Reveal>
        </Reveal>
      </section>
      <Rotation initialMood={params.mood} />
      <section className="category-section shell" aria-label="Shop by category">
        <Link
          href="/shop?category=Clothing"
          className="category-block clothing-block"
        >
          <span className="eyebrow">01 / THE FOUNDATION</span>
          <h2>
            Live-in
            <br />
            layers.
          </h2>
          <span className="category-link">
            Shop clothing <span aria-hidden>↗</span>
          </span>
          <span className="category-decoration" aria-hidden>
            Cl.
          </span>
        </Link>
        <Link
          href="/shop?category=Footwear"
          className="category-block footwear-block"
        >
          <span className="eyebrow">02 / FROM THE GROUND UP</span>
          <h2>
            Go your
            <br />
            own way.
          </h2>
          <Image
            src="/images/sneaker.svg"
            width={600}
            height={700}
            alt=""
            className="category-shoe"
          />
          <span className="category-link">
            Shop footwear <span aria-hidden>↗</span>
          </span>
        </Link>
      </section>
      <MotionBand />
      <JournalSection />
      <section className="approach-section shell">
        <span className="eyebrow">THE FORME APPROACH</span>
        <div>
          <h2>
            A wardrobe that
            <br />
            feels like <span>you.</span>
          </h2>
          <p>
            No dress code. No overthinking. Just considered clothing and
            footwear that fit into your life, whatever your everyday looks like.
          </p>
          <Link href="/about" className="text-link">
            A little more about us <span aria-hidden>↗</span>
          </Link>
        </div>
        <span className="approach-mark" aria-hidden>
          F.
        </span>
      </section>
      <div className="demo-note shell">
        <span className="eyebrow">A PORTFOLIO CONCEPT</span>
        <p>
          Designed & built by Fuhad Adeyanju. Explore the collection and try a
          demo order. Nothing is sold or shipped.
        </p>
      </div>
    </main>
  );
}
