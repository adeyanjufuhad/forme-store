"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  XIcon,
  RulerIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/types";
import { useStore } from "./store-provider";

export function ProductDetail({ product }: { product: Product }) {
  const { currency, add, ready, items } = useStore();
  const [size, setSize] = useState(
    product.sizes.length === 1 ? product.sizes[0] : "",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lifestyle, setLifestyle] = useState(false);
  const guide = useRef<HTMLDialogElement>(null);
  const sizes = useRef<HTMLFieldSetElement>(null);
  const selectedQuantity =
    items.find((item) => item.productId === product.id && item.size === size)
      ?.quantity || 0;
  const totalQuantity = items
    .filter((item) => item.productId === product.id)
    .reduce((total, item) => total + item.quantity, 0);
  const limitReached = selectedQuantity >= 10 || totalQuantity >= product.stock;
  function addToBag() {
    if (!size) {
      setError("Choose your size first.");
      sizes.current?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    add(product, size);
    setError("");
    setMessage(`${product.name}, ${size}, added to your bag.`);
  }
  return (
    <div className="product-detail">
      <div className="detail-gallery">
        <div className={`detail-image ${lifestyle ? "lifestyle" : ""}`}>
          <Image
            src={lifestyle ? "/images/campaign.jpg" : product.image}
            alt={
              lifestyle
                ? "The FORME everyday outfit on our campaign model"
                : `${product.name} in ${product.color}`
            }
            fill
            sizes="(max-width: 767px) 100vw, 55vw"
            priority
          />
        </div>
        <div className="image-options">
          <button aria-pressed={!lifestyle} onClick={() => setLifestyle(false)}>
            Collection photo
          </button>
          <button aria-pressed={lifestyle} onClick={() => setLifestyle(true)}>
            Campaign look
          </button>
        </div>
      </div>
      <div className="detail-copy">
        <Link href="/shop" className="eyebrow breadcrumb">
          COLLECTION / {product.category.toUpperCase()}
        </Link>
        {product.tag && (
          <span className="eyebrow detail-tag">{product.tag}</span>
        )}
        <h1>
          {product.name}
          <span className="orange">.</span>
        </h1>
        <p className="detail-price">
          {money(product.prices[currency], currency)}
        </p>
        <p className="detail-description">{product.description}</p>
        <div className="color-choice">
          <span
            className="color-swatch"
            style={{
              background: product.color.includes("Pumpkin")
                ? "#FE7F2D"
                : product.color.includes("Charcoal")
                  ? "#233D4D"
                  : "#C7B79D",
            }}
          />
          <span>{product.color}</span>
        </div>
        <fieldset
          ref={sizes}
          className="size-fieldset"
          aria-describedby={error ? "size-error" : undefined}
        >
          <legend>Choose your size</legend>
          <div className="size-options">
            {product.sizes.map((s) => (
              <label key={s} className={size === s ? "chosen" : ""}>
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={s === size}
                  onChange={() => {
                    setSize(s);
                    setError("");
                    setMessage("");
                  }}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          className="size-guide"
          onClick={() => guide.current?.showModal()}
        >
          <RulerIcon size={18} aria-hidden />
          Size notes
        </button>
        {error && (
          <p className="field-error" id="size-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button button-dark add-button"
          disabled={!ready || product.stock === 0 || limitReached}
          onClick={addToBag}
        >
          {product.stock === 0
            ? "Currently unavailable"
            : limitReached
              ? "Bag limit reached"
              : "Add to bag"}
          <ArrowUpRightIcon aria-hidden size={21} />
        </button>
        <div className="added-message" aria-live="polite">
          {message && (
            <>
              <CheckIcon aria-hidden size={18} />
              <span>
                {message} <Link href="/bag">View bag ↗</Link>
              </span>
            </>
          )}
        </div>
        <div className="detail-accordions">
          <details open>
            <summary>The details</summary>
            <p>{product.detail}</p>
          </details>
          <details>
            <summary>Delivery & returns</summary>
            <p>
              FORME is a portfolio concept. Nothing is sold or shipped, and no
              payment is collected. You can explore the complete shopping flow
              using a demo order.
            </p>
          </details>
        </div>
        <p className="catalog-caption">
          Portfolio collection / fictional products and prices.
        </p>
      </div>
      <dialog ref={guide} className="size-dialog">
        <div className="dialog-heading">
          <h2>Find your fit.</h2>
          <button
            className="icon-button"
            aria-label="Close size notes"
            onClick={() => guide.current?.close()}
          >
            <XIcon size={23} aria-hidden />
          </button>
        </div>
        <p>
          Clothing uses standard letter sizes. Footwear uses EU sizing. The
          Studio Cap is adjustable.
        </p>
        <p>
          Sizes are included to demonstrate the shopping experience. This
          fictional collection has no physical inventory or supplier size chart.
        </p>
        <button
          className="button button-dark"
          onClick={() => guide.current?.close()}
        >
          Back to the piece
        </button>
      </dialog>
    </div>
  );
}
