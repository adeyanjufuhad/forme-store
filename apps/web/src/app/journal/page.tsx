import type { Metadata } from "next";
import { JournalSection } from "@/components/journal-section";
export const metadata: Metadata = { title: "The journal" };
export default function Journal() {
  return (
    <main id="main">
      <div className="page-heading shell">
        <span className="eyebrow">THE FORME JOURNAL</span>
        <h1>
          Everyday things.
          <br />A fresh perspective<span className="orange">.</span>
        </h1>
        <p>
          Style notes, easy combinations, and little things worth keeping in
          mind.
        </p>
      </div>
      <JournalSection />
    </main>
  );
}
