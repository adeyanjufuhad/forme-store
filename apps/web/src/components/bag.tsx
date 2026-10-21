"use client";
import Link from "next/link";
import Image from "next/image";
import { MinusIcon, PlusIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { money, type Product } from "@/lib/types";
import { useStore } from "./store-provider";
export function Bag({ products }: { products: Product[] }) {
  const { items, update, currency, ready, clear } = useStore();
  const lines = items.map((item) => ({
    item,
    product: products.find((p) => p.id === item.productId),
  }));
  const total = lines.reduce(
    (sum, { item, product }) =>
      sum + (product?.prices[currency] || 0) * item.quantity,
    0,
  );
  const quantities = items.reduce<Record<string, number>>((totals, item) => {
    totals[item.productId] = (totals[item.productId] || 0) + item.quantity;
    return totals;
  }, {});
  if (!ready)
    return (
      <div
        className="skeleton skeleton-title"
        role="status"
        aria-label="Loading bag"
      />
    );
  if (!items.length)
    return (
      <div className="empty-state bag-empty">
        <span aria-hidden className="empty-bag-mark">
          0
        </span>
        <h2>A little room for something good.</h2>
        <p>Your bag is empty. Find a piece you’ll want to wear again.</p>
        <Link href="/shop" className="button button-dark">
          Explore the collection <ArrowUpRightIcon aria-hidden size={19} />
        </Link>
      </div>
    );
  const unavailable = lines.some(
    ({ product, item }) =>
      !product ||
      product.stock < quantities[product.id] ||
      !product.sizes.includes(item.size),
  );
  return (
    <div className="bag-layout">
      <div>
        <div className="bag-table-header eyebrow">
          <span>YOUR PIECES</span>
          <span>QUANTITY / PRICE</span>
        </div>
        {lines.map(({ item, product }) =>
          product ? (
            <article className="bag-row" key={`${item.productId}-${item.size}`}>
              <Link className="bag-image" href={`/products/${product.id}`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={160}
                  height={180}
                />
              </Link>
              <div className="bag-product-info">
                <Link href={`/products/${product.id}`}>
                  <h2>{product.name}</h2>
                </Link>
                <p>
                  {product.color} / {item.size}
                </p>
                <button
                  className="remove-link"
                  onClick={() => update(item.productId, item.size, 0)}
                  aria-label={`Remove ${product.name}, ${item.size}`}
                >
                  Remove
                </button>
              </div>
              <div className="quantity-price">
                <div className="quantity-control">
                  <button
                    aria-label={`Decrease ${product.name} quantity`}
                    onClick={() =>
                      update(item.productId, item.size, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon size={15} aria-hidden />
                  </button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    aria-label={`Increase ${product.name} quantity`}
                    onClick={() =>
                      update(item.productId, item.size, item.quantity + 1)
                    }
                    disabled={
                      item.quantity >= 10 ||
                      quantities[product.id] >= product.stock
                    }
                  >
                    <PlusIcon size={15} aria-hidden />
                  </button>
                </div>
                <span>
                  {money(product.prices[currency] * item.quantity, currency)}
                </span>
              </div>
            </article>
          ) : (
            <div className="bag-row" key={`${item.productId}-${item.size}`}>
              <p>This piece is no longer available.</p>
              <button
                className="text-link"
                onClick={() => update(item.productId, item.size, 0)}
              >
                Remove unavailable piece
              </button>
            </div>
          ),
        )}
        <Link href="/shop" className="text-link continue-shopping">
          ← Keep exploring
        </Link>
      </div>
      <aside className="order-summary">
        <span className="eyebrow">THE GOOD STUFF, TOGETHER.</span>
        <h2>Your bag, in total.</h2>
        <div className="summary-line">
          <span>Subtotal</span>
          <span>{money(total, currency)}</span>
        </div>
        <div className="summary-line">
          <span>Delivery & taxes</span>
          <span>Demo only</span>
        </div>
        <div className="summary-line summary-total">
          <span>Subtotal ({currency})</span>
          <span>{money(total, currency)}</span>
        </div>
        <p>
          A portfolio demo, from first piece to final click. Prices are
          fictional; no payments or deliveries are involved.
        </p>
        {unavailable ? (
          <>
            <p className="field-error" role="alert">
              A piece or size is unavailable. Remove it or reduce the quantity
              before checkout.
            </p>
            <button className="text-link" onClick={clear}>
              Empty bag and start again
            </button>
          </>
        ) : (
          <Link href="/checkout" className="button button-dark">
            Continue to checkout <ArrowUpRightIcon aria-hidden size={20} />
          </Link>
        )}
      </aside>
    </div>
  );
}
