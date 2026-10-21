import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { journal } from "@/lib/journal";
import { Reveal } from "@/components/reveal";
export function generateStaticParams() {
  return journal.map((story) => ({ slug: story.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title:
      journal.find((story) => story.slug === slug)?.title || "Story not found",
  };
}
export default async function Story({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = journal.find((story) => story.slug === slug);
  if (!story) notFound();
  return (
    <main id="main" className="story-page shell">
      <Link href="/journal" className="eyebrow breadcrumb">
        ← THE JOURNAL
      </Link>
      <div className="story-heading">
        <div>
          <span className="eyebrow">
            {story.category} / {story.number}
          </span>
          <h1>{story.title}</h1>
        </div>
        <p>{story.intro}</p>
      </div>
      <div className="story-body">
        <div className="story-photo">
          <Image
            src={story.image}
            width={1100}
            height={1400}
            alt={story.alt}
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
        <div className="story-text">
          {story.sections.map((section, i) => (
            <Reveal key={section.title}>
              <section>
                <span className="eyebrow">0{i + 1}</span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            </Reveal>
          ))}
          <Link href="/shop" className="button button-dark">
            Find your everyday ↗
          </Link>
          <Link href="/credits" className="photo-credits-link">
            Photography credits
          </Link>
        </div>
      </div>
    </main>
  );
}
