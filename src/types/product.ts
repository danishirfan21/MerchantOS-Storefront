export type Product = {
  id: string;
  name: string;
  brand: string;
  /** Short spec line, e.g. "256GB · Titanium". */
  spec?: string;
  /** Current price in SAR. */
  price: number;
  /** Original price in SAR, when discounted. */
  compareAtPrice?: number;
  stock: "in-stock" | "low-stock" | "out-of-stock";
  /** Units left, shown when stock is low. */
  stockCount?: number;
  badge?: string;
  /** Authorized product image. Absent until real assets are supplied. */
  imageUrl?: string;
  /** Link to the product page, once that page exists. */
  href?: string;
};
