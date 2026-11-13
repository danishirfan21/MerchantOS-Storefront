import type { Product } from "@/types/product";

/**
 * Fictional demo catalogue used to build and verify product discovery. It is NOT
 * live inventory: brands, names, prices and stock are invented. Order = "Featured" order.
 * Ids are stable so later pages (product detail, cart) can reference them.
 */
export const catalogProducts: Product[] = [
  { id: "p1", name: "Flagship smartphone 256GB", brand: "Nova", category: "smartphones", storage: "256GB", spec: "6.7-inch display · Titanium finish", price: 5199, compareAtPrice: 5499, stock: "in-stock", badge: "New" },
  { id: "p2", name: "Wireless noise-cancelling headphones", brand: "Aurora", category: "audio", spec: "30-hour battery · Hi-res audio", price: 1149, compareAtPrice: 1399, stock: "in-stock" },
  { id: "p3", name: "Performance laptop 16-inch OLED", brand: "Vertex", category: "laptops", storage: "1TB", spec: "32GB memory · OLED display", price: 8499, stock: "low-stock", stockCount: 4 },
  { id: "p4", name: "Rugged smartwatch 49mm", brand: "Helix", category: "wearables", spec: "GPS + Cellular · Titanium case", price: 3299, compareAtPrice: 3499, stock: "in-stock" },
  { id: "p5", name: "Foldable smartphone 512GB", brand: "Helix", category: "smartphones", storage: "512GB", spec: "7.6-inch inner display · Flex hinge", price: 6499, stock: "in-stock", badge: "Foldable" },
  { id: "p6", name: "Camera smartphone 512GB", brand: "Vertex", category: "smartphones", storage: "512GB", spec: "Triple camera · 5x optical zoom", price: 4699, compareAtPrice: 5399, stock: "in-stock" },
  { id: "p7", name: "Compact smartphone 128GB", brand: "Aurora", category: "smartphones", storage: "128GB", spec: "6.1-inch display · All-day battery", price: 2899, stock: "low-stock", stockCount: 3 },
  { id: "p8", name: "Everyday smartphone 128GB", brand: "Orbit", category: "smartphones", storage: "128GB", spec: "6.5-inch display · Fast charging", price: 1299, stock: "out-of-stock" },
  { id: "p9", name: "Flagship smartphone 1TB", brand: "Nova", category: "smartphones", storage: "1TB", spec: "6.9-inch display · Titanium finish", price: 6899, stock: "in-stock" },
  { id: "p10", name: "Pro laptop 16-inch", brand: "Vertex", category: "laptops", storage: "1TB", spec: "36GB memory · Dark finish", price: 7999, stock: "in-stock", badge: "Special offer" },
  { id: "p11", name: "Ultralight laptop 14-inch", brand: "Aurora", category: "laptops", storage: "512GB", spec: "16GB memory · 1.1 kg", price: 5299, stock: "in-stock" },
  { id: "p12", name: "Gaming laptop 17-inch", brand: "Helix", category: "laptops", storage: "1TB", spec: "Dedicated graphics · 240Hz display", price: 9899, stock: "in-stock" },
  { id: "p13", name: "Everyday laptop 15-inch", brand: "Orbit", category: "laptops", storage: "256GB", spec: "8GB memory · Full HD display", price: 2499, compareAtPrice: 2799, stock: "in-stock" },
  { id: "p14", name: "True wireless earbuds", brand: "Nova", category: "audio", spec: "Adaptive noise cancelling · Wireless charging", price: 649, stock: "in-stock" },
  { id: "p15", name: "Portable Bluetooth speaker", brand: "Orbit", category: "audio", spec: "20-hour battery · Water resistant", price: 349, stock: "in-stock" },
  { id: "p16", name: "Dolby soundbar with subwoofer", brand: "Helix", category: "audio", spec: "5.1 channels · Wireless sub", price: 1799, stock: "out-of-stock" },
  { id: "p17", name: "65-inch OLED 4K television", brand: "Vertex", category: "tvs", spec: "120Hz · Dolby Vision", price: 5899, compareAtPrice: 7999, stock: "in-stock", badge: "Deal" },
  { id: "p18", name: "55-inch 4K LED television", brand: "Orbit", category: "tvs", spec: "60Hz · Smart platform", price: 1999, stock: "in-stock" },
  { id: "p19", name: "75-inch QLED 4K television", brand: "Helix", category: "tvs", spec: "120Hz · Quantum dot colour", price: 3999, stock: "low-stock", stockCount: 2 },
  { id: "p20", name: "Home gaming console 1TB", brand: "Nova", category: "gaming", storage: "1TB", spec: "4K gaming · Fast SSD", price: 1999, stock: "in-stock" },
  { id: "p21", name: "Wireless game controller", brand: "Nova", category: "gaming", spec: "Haptic feedback · 40-hour battery", price: 249, stock: "in-stock" },
  { id: "p22", name: "Wireless gaming headset", brand: "Helix", category: "gaming", spec: "Surround sound · Detachable mic", price: 449, stock: "in-stock" },
  { id: "p23", name: "Fitness band", brand: "Orbit", category: "wearables", spec: "14-day battery · Heart-rate tracking", price: 199, stock: "in-stock" },
  { id: "p24", name: "Mirrorless camera body", brand: "Vertex", category: "cameras", spec: "26MP sensor · 4K video", price: 6299, stock: "in-stock" },
  { id: "p25", name: "Action camera 5K", brand: "Orbit", category: "cameras", spec: "Waterproof · Image stabilisation", price: 1199, compareAtPrice: 1399, stock: "in-stock" },
];

const featuredIds = ["p1", "p2", "p3", "p4"];

/** Homepage "Featured" picks: the same records the catalogue lists, not copies. */
export const featuredProducts: Product[] = featuredIds.flatMap((id) => catalogProducts.filter((product) => product.id === id));
