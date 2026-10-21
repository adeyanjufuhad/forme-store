"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/types";
import { useStore } from "./store-provider";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { currency } = useStore();
  return (
    <article className="product-card">
      <Link
        href={`/products/${product.id}`}
        className="product-image"
        aria-label={`View ${product.name}`}
      >
        <span className="product-index" aria-hidden>
          {String(index + 1).padStart(2, "0")}
        </span>
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <Image
          src={product.image}
          alt={`${product.name} in ${product.color}`}
          width={600}
          height={700}
          sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
        />
        <span className="product-open">
          <ArrowUpRightIcon size={23} aria-hidden />
        </span>
      </Link>
      <div className="product-meta">
        <Link href={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p className="product-price">
          {money(product.prices[currency], currency)}
        </p>
      </div>
      <p className="product-color">{product.color}</p>
    </article>
  );
}
