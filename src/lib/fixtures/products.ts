import type { Product } from "@/types/product";

/**
 * Temporary sample data used to build and verify the Homepage. It is NOT live
 * inventory: names are generic and no real catalogue, price or image is implied.
 */
export const featuredProducts: Product[] = [
  { id: "p1", name: "Flagship smartphone 256GB", brand: "Sample brand", spec: "6.7-inch display · Titanium finish", price: 5199, compareAtPrice: 5499, stock: "in-stock", badge: "New" },
  { id: "p2", name: "Wireless noise-cancelling headphones", brand: "Sample brand", spec: "30-hour battery · Hi-res audio", price: 1149, compareAtPrice: 1399, stock: "in-stock" },
  { id: "p3", name: "Performance laptop 16-inch OLED", brand: "Sample brand", spec: "32GB memory · 1TB storage", price: 8499, stock: "low-stock", stockCount: 4 },
  { id: "p4", name: "Rugged smartwatch 49mm", brand: "Sample brand", spec: "GPS + Cellular · Titanium case", price: 3299, compareAtPrice: 3499, stock: "in-stock" },
];
