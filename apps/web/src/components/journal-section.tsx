import Image from "next/image";
import Link from "next/link";
import { journal } from "@/lib/journal";
import { Reveal } from "./reveal";
export function JournalSection() {
  return (
    <section className="journal-section shell" aria-labelledby="journal-title">
      <Reveal>
        <div className="section-heading">
          <div>
            <span className="eyebrow">OFF THE RACK / ON YOUR MIND</span>
            <h2 id="journal-title">
              A little inspiration<span className="orange">.</span>
            </h2>
          </div>
          <Link href="/journal" className="text-link">
            The journal <span aria-hidden>↗</span>
          </Link>
        </div>
      </Reveal>
      <Reveal className="journal-grid" stagger={0.14}>
        {journal.map((story, i) => (
          <article
            className={`journal-card ${i === 0 ? "journal-featured" : ""}`}
            key={story.slug}
          >
            <Link href={`/journal/${story.slug}`} className="journal-image">
              <Image
                src={story.image}
                alt={story.alt}
                width={900}
                height={1000}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
              <span className="journal-arrow" aria-hidden>
                ↗
              </span>
            </Link>
            <div className="journal-copy">
              <span className="eyebrow">
                {story.category} / {story.number}
              </span>
              <Link href={`/journal/${story.slug}`}>
                <h3>{story.title}</h3>
              </Link>
              <p>{story.intro}</p>
              <Link href={`/journal/${story.slug}`} className="text-link">
                Read the story <span aria-hidden>↗</span>
              </Link>
            </div>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
