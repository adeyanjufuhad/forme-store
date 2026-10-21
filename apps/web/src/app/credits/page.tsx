import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Project & image credits" };
const credits = [
  [
    "Sand hoodie — Angela Roma",
    "https://www.pexels.com/photo/serious-young-woman-in-trendy-hoodie-in-studio-7479818/",
  ],
  [
    "Canvas high-tops — Ana Vieira",
    "https://www.pexels.com/photo/brown-shoes-on-white-background-26542853/",
  ],
  [
    "Black trouser styling — joao Guerreiro",
    "https://www.pexels.com/photo/model-posing-in-black-pants-15299024/",
  ],
  [
    "Cap on a bench",
    "https://www.pexels.com/photo/photo-of-a-brown-cap-on-a-bench-7562957/",
  ],
  [
    "Orange hoodie portrait",
    "https://www.pexels.com/photo/young-woman-in-an-orange-hoodie-13871652/",
  ],
  [
    "Brown low-top sneakers — Ishaan Aggarwal",
    "https://www.pexels.com/photo/brown-and-white-sneakers-on-white-background-7926150/",
  ],
  [
    "City tailoring — SAAD EMRIS",
    "https://www.pexels.com/photo/young-man-in-a-beige-suit-and-sneakers-walking-on-the-pavement-17086283/",
  ],
  [
    "Studio utility styling — Maria Merino herrero",
    "https://www.pexels.com/photo/model-in-beige-jacket-and-cargo-pants-20520506/",
  ],
  [
    "Off-duty streetwear — cottonbro studio",
    "https://www.pexels.com/photo/a-man-in-beige-hoodie-sitting-on-the-street-5319306/",
  ],
  [
    "Street portrait — mehrab zahedbeigi",
    "https://www.pexels.com/photo/beautiful-woman-wearing-black-hoodie-and-black-cap-12990463/",
  ],
];
export default function Credits() {
  return (
    <main id="main" className="shell credits-page">
      <div className="page-heading">
        <span className="eyebrow">THE PEOPLE BEHIND THE PICTURES</span>
        <h1>
          Good things.
          <br />
          Good company<span className="orange">.</span>
        </h1>
        <p>
          FORME is a non-commercial portfolio concept by Fuhad Adeyanju. Product
          names and prices are fictional. The featured photographers, models,
          and visible brands are not affiliated with this project.
        </p>
      </div>
      <section>
        <h2>Photography.</h2>
        <p>
          The hero campaign photograph was supplied for this project. Additional
          editorial and collection imagery comes from Pexels, used under the{" "}
          <a href="https://www.pexels.com/license/" className="text-link">
            Pexels License ↗
          </a>
          .
        </p>
        <ul>
          {credits.map(([label, url]) => (
            <li key={url}>
              <a href={url}>
                {label}
                <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Design & development.</h2>
        <p>
          Original brand concept, interface, and editorial copy for this
          portfolio project. Built with Next.js, Go, and Neon. AnimatedContent
          and ScrollVelocity are adapted from React Bits.
        </p>
        <a
          href="https://github.com/adeyanjufuhad/forme-store"
          className="text-link"
        >
          Explore the source ↗
        </a>
      </section>
      <Link href="/" className="button button-dark">
        Back to FORME ↗
      </Link>
    </main>
  );
}
