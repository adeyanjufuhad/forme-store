import "server-only";
import type { Product } from "./types";

export async function getCatalog(): Promise<{
  products: Product[];
  mode: "demo" | "database";
}> {
  const response = await fetch(
    `${process.env.API_INTERNAL_URL || "http://127.0.0.1:8080"}/api/products`,
    { cache: "no-store", signal: AbortSignal.timeout(5000) },
  );
  if (!response.ok) throw new Error("The collection could not be loaded.");
  return response.json();
}
