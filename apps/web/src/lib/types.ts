export type Currency = "NGN" | "USD";
export type Product = {
  id: string;
  name: string;
  category: "Clothing" | "Footwear" | "Accessories";
  description: string;
  detail: string;
  color: string;
  image: string;
  prices: Record<Currency, number>;
  sizes: string[];
  stock: number;
  tag?: string;
};
export type BagItem = { productId: string; size: string; quantity: number };
export const money = (minor: number, currency: Currency) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
