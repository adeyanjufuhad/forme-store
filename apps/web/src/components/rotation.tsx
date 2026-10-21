"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import "./rotation.css";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "./motion-provider";
import { KineticShapes } from "./kinetic-shapes";
const moods = [
  {
    id: "easy",
    label: "The easy day",
    caption: "COFFEE FIRST. EVERYTHING ELSE LATER.",
    image: "/images/off-duty.jpg",
    alt: "A man in a relaxed beige hoodie and black trousers on a city street",
    text: "A little room to move. A warm neutral layer. Your favorite pair, on repeat.",
    pieces: [
      { id: "daily-hoodie", name: "The Daily Hoodie" },
      { id: "relaxed-trouser", name: "The Relaxed Trouser" },
      { id: "court-high", name: "Canvas High 01" },
    ],
  },
  {
    id: "city",
    label: "Out in the city",
    caption: "NO PLANS. GOOD PLACES TO BE.",
    image: "/images/city-look.jpg",
    alt: "A model in relaxed sand-colored tailoring and sneakers walking through the city",
    text: "A sharper layer, an easy silhouette, and somewhere new to wander.",
    pieces: [
      { id: "city-layer", name: "The City Layer" },
      { id: "court-low", name: "The Everyday Low" },
      { id: "studio-cap", name: "The Studio Cap" },
    ],
  },
  {
    id: "color",
    label: "A brighter mood",
    caption: "SAME YOU. A LITTLE MORE COLOR.",
    image: "/images/orange-hoodie.jpg",
    alt: "A model in an orange hoodie",
    text: "One confident color. Everything else kept simple. Let the day come to you.",
    pieces: [
      { id: "orange-hoodie", name: "The Weekend Hoodie" },
      { id: "relaxed-trouser", name: "The Relaxed Trouser" },
      { id: "court-low", name: "The Everyday Low" },
    ],
  },
];
export function Rotation({ initialMood }: { initialMood?: string }) {
  const [active, setActive] = useState(
    Math.max(
      0,
      moods.findIndex((mood) => mood.id === initialMood),
    ),
  );
  const { paused, reduced } = useMotionPreference();
  const tabs = useRef<HTMLDivElement>(null);
  const mood = moods[active];
  useEffect(() => {
    const update = () => {
      const selected = new URL(window.location.href).searchParams.get("mood");
      setActive(
        Math.max(
          0,
          moods.findIndex((item) => item.id === selected),
        ),
      );
    };
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  const choose = (index: number) => {
    setActive(index);
    const url = new URL(window.location.href);
    url.searchParams.set("mood", moods[index].id);
    window.history.replaceState(null, "", url);
  };
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % moods.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index + moods.length - 1) % moods.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = moods.length - 1;
    else return;
    event.preventDefault();
    choose(next);
    tabs.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };
  return (
    <section
      className="rotation-section shell"
      aria-labelledby="rotation-title"
    >
      <div className="rotation-copy">
        <span className="eyebrow">THE ROTATION / PICK YOUR EVERYDAY</span>
        <h2 id="rotation-title">
          A shape for
          <br />
          every kind
          <br />
          of day<span className="orange">.</span>
        </h2>
        <p>
          You bring the mood.
          <br />
          We’ll bring a little inspiration.
        </p>
        <div
          role="tablist"
          aria-label="Choose an outfit mood"
          aria-orientation="vertical"
          ref={tabs}
          className="mood-tabs"
        >
          {moods.map((item, index) => (
            <button
              role="tab"
              id={`mood-${item.id}`}
              aria-controls="mood-panel"
              aria-selected={index === active}
              tabIndex={index === active ? 0 : -1}
              key={item.id}
              onClick={() => choose(index)}
              onKeyDown={(event) => keyboard(event, index)}
            >
              <span className="eyebrow">0{index + 1}</span>
              <span>{item.label}</span>
              <span aria-hidden>↗</span>
            </button>
          ))}
        </div>
        <KineticShapes variant="rotation" />
      </div>
      <div
        id="mood-panel"
        role="tabpanel"
        aria-labelledby={`mood-${mood.id}`}
        className="rotation-panel"
      >
        <div className="rotation-image">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mood.id}
              className="rotation-photo"
              initial={paused || reduced ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={paused || reduced ? { opacity: 1 } : { opacity: 0, x: -18 }}
              transition={{ type: "spring", stiffness: 150, damping: 24 }}
            >
              <Image
                src={mood.image}
                alt={mood.alt}
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>
          <span className="rotation-image-label eyebrow">{mood.caption}</span>
          <span className="rotation-number" aria-hidden>
            0{active + 1}
          </span>
        </div>
        <div className="rotation-details">
          <p>{mood.text}</p>
          <nav aria-label={`${mood.label} pieces`}>
            {mood.pieces.map((piece) => (
              <Link key={piece.id} href={`/products/${piece.id}`}>
                {piece.name}
                <span aria-hidden>↗</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
