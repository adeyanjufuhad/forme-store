"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRightIcon, CheckIcon } from "@phosphor-icons/react";
import { money, type Product } from "@/lib/types";
import { useStore } from "./store-provider";
type Receipt = {
  id: string;
  total: number;
  currency: "NGN" | "USD";
  demo: boolean;
  status: string;
};
export function Checkout({
  products,
  mode,
}: {
  products: Product[];
  mode: string;
}) {
  const { items, currency, clear, ready } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const requestRef = useRef<{ body: string; key: string } | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const lines = items.map((item) => ({
    item,
    product: products.find((p) => p.id === item.productId),
  }));
  const total = lines.reduce(
    (sum, { item, product }) =>
      sum + (product?.prices[currency] || 0) * item.quantity,
    0,
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(
      ["name", "email", "address", "city", "country", "postalCode"].map((k) => [
        k,
        String(form.get(k) || "").trim(),
      ]),
    );
    const body = JSON.stringify({ currency, items, customer });
    if (requestRef.current?.body !== body)
      requestRef.current = { body, key: crypto.randomUUID() };
    try {
      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestRef.current!.key,
        },
        body,
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your order could not be saved. Please try again.",
        );
      setReceipt(result);
      clear();
    } catch (err) {
      setError(
        err instanceof Error && err.name !== "TimeoutError"
          ? err.message
          : "The connection took too long. Please retry; your order will not be duplicated.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <div
        className="skeleton skeleton-title"
        role="status"
        aria-label="Loading checkout"
      />
    );
  if (receipt)
    return (
      <div className="receipt" role="status">
        <span className="receipt-check">
          <CheckIcon size={35} aria-hidden />
        </span>
        <span className="eyebrow">DEMO ORDER SAVED</span>
        <h2>
          Looking good<span className="orange">.</span>
        </h2>
        <p>Your demo order has been saved. No payment has been taken.</p>
        <div className="receipt-details">
          <span>Reference</span>
          <strong className="receipt-id">{receipt.id}</strong>
          <span>Product subtotal</span>
          <strong>{money(receipt.total, receipt.currency)}</strong>
          <span>Status</span>
          <strong>Demo order</strong>
        </div>
        <p>
          This is a portfolio demonstration. Nothing will be charged or shipped.
        </p>
        <Link href="/shop" className="button button-dark">
          Back to the collection <ArrowUpRightIcon aria-hidden size={20} />
        </Link>
      </div>
    );
  if (!items.length)
    return (
      <div className="empty-state">
        <h2>Your bag comes first.</h2>
        <p>Add a piece from the collection to start checkout.</p>
        <Link href="/shop" className="button button-dark">
          Find your form ↗
        </Link>
      </div>
    );
  return (
    <div className="checkout-layout">
      <form onSubmit={submit} className="checkout-form">
        <Link href="/bag" className="eyebrow breadcrumb">
          ← BACK TO YOUR BAG
        </Link>
        <h2>The delivery details.</h2>
        <p className="checkout-notice">
          Try the complete demo with the sample details below. No purchases,
          payments, or deliveries.
        </p>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={150}
              defaultValue="Portfolio Visitor"
            />
          </div>
          <div className="form-field full">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              defaultValue="visitor@example.com"
              spellCheck={false}
            />
          </div>
          <div className="form-field full">
            <label htmlFor="address">Street address</label>
            <input
              id="address"
              name="address"
              autoComplete="street-address"
              required
              minLength={2}
              maxLength={300}
              defaultValue="12 Concept Street"
            />
          </div>
          <div className="form-field">
            <label htmlFor="city">City</label>
            <input
              defaultValue="Lagos"
              id="city"
              name="city"
              autoComplete="address-level2"
              required
              minLength={2}
              maxLength={150}
            />
          </div>
          <div className="form-field">
            <label htmlFor="postalCode">Postal code (optional)</label>
            <input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              maxLength={30}
            />
          </div>
          <div className="form-field full">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              autoComplete="country-name"
              required
              defaultValue="Nigeria"
            >
              <option value="" disabled>
                Choose your country
              </option>
              <option>Nigeria</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Ghana</option>
              <option>Canada</option>
            </select>
          </div>
        </div>
        {error && (
          <p ref={errorRef} tabIndex={-1} className="field-error" role="alert">
            {error}
          </p>
        )}
        <button className="button button-dark" type="submit" disabled={busy}>
          {busy ? "Saving your order…" : "Place demo order"}
          <ArrowUpRightIcon size={20} aria-hidden />
        </button>
        <p className="catalog-caption">
          Use sample details only. This project stores a fictional customer
          identity for every demo order.
        </p>
      </form>
      <aside className="order-summary">
        <span className="eyebrow">A GOOD CHOICE.</span>
        <h2>Coming together.</h2>
        {lines.map(({ item, product }) => (
          <div key={`${item.productId}-${item.size}`} className="checkout-line">
            <div>
              <strong>{product?.name || "Unavailable piece"}</strong>
              <span>
                {item.size} / Qty {item.quantity}
              </span>
            </div>
            <span>
              {money(
                (product?.prices[currency] || 0) * item.quantity,
                currency,
              )}
            </span>
          </div>
        ))}
        <div className="summary-line summary-total">
          <span>Subtotal ({currency})</span>
          <strong>{money(total, currency)}</strong>
        </div>
        <p>
          All prices are fictional. The demo checks your selected pieces and
          confirms the subtotal when you submit.
        </p>
      </aside>
    </div>
  );
}
