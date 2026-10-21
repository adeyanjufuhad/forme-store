"use client";

import Link from "next/link";
import {
  ArrowUpRightIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  BagIcon,
  ListIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useStore } from "./store-provider";
import { useMotionPreference } from "./motion-provider";

export function Header() {
  const { currency, setCurrency, items } = useStore();
  const path = usePathname();
  const { paused, reduced, toggle } = useMotionPreference();
  const count = items.reduce((total, item) => total + item.quantity, 0);
  return (
    <>
      <div className="announcement">
        <span>GOOD CLOTHES. EVERYDAY PEOPLE.</span>
        <Link href="/shop">
          Meet your new rotation <ArrowUpRightIcon aria-hidden size={13} />
        </Link>
      </div>
      <header className="site-header shell flex items-center justify-between gap-6">
        <Link
          href="/"
          className="wordmark"
          aria-label="FORME home"
          translate="no"
        >
          FORME<span className="logo-dot">.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="desktop-nav flex items-center gap-8"
        >
          <Link
            href="/shop"
            aria-current={path === "/shop" ? "page" : undefined}
          >
            Shop all
          </Link>
          <Link href="/shop?category=Clothing">Clothing</Link>
          <Link href="/shop?category=Footwear">Footwear</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/about">Our approach</Link>
        </nav>
        <div className="header-tools flex items-center gap-3">
          <button
            className="motion-toggle icon-button"
            onClick={toggle}
            disabled={reduced}
            aria-label={
              reduced
                ? "Motion disabled by your device settings"
                : paused
                  ? "Play animations"
                  : "Pause animations"
            }
            title={paused ? "Play animations" : "Pause animations"}
          >
            {paused || reduced ? (
              <PlayIcon size={17} aria-hidden />
            ) : (
              <PauseIcon size={17} aria-hidden />
            )}
          </button>
          <label className="sr-only" htmlFor="currency">
            Shopping currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "NGN" | "USD")}
            className="currency-select"
          >
            <option value="NGN">NGN ₦</option>
            <option value="USD">USD $</option>
          </select>
          <Link
            href="/shop#search"
            className="icon-button search-link"
            aria-label="Search products"
          >
            <MagnifyingGlassIcon aria-hidden size={21} />
          </Link>
          <Link
            href="/bag"
            className="bag-link flex items-center gap-2"
            aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <BagIcon aria-hidden size={21} />
            <span className="bag-count">{count}</span>
          </Link>
        </div>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">
            <ListIcon size={23} aria-hidden />
          </summary>
          <nav aria-label="Mobile navigation">
            <Link href="/shop">
              Shop all <ArrowRightIcon aria-hidden />
            </Link>
            <Link href="/shop?category=Clothing">Clothing</Link>
            <Link href="/shop?category=Footwear">Footwear</Link>
            <Link href="/about">Our approach</Link>
            <Link href="/journal">Journal</Link>
          </nav>
        </details>
      </header>
    </>
  );
}
