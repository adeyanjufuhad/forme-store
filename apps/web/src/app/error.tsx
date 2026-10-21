"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="shell empty-page">
      <span className="eyebrow">A LITTLE PAUSE</span>
      <h1>The collection is taking a moment.</h1>
      <p>Please try again shortly. Your bag is saved on this device.</p>
      <button className="button button-dark" onClick={reset}>
        Try again ↗
      </button>
    </main>
  );
}
