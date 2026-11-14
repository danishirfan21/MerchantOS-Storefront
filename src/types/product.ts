export type CategorySlug = "smartphones" | "laptops" | "audio" | "tvs" | "gaming" | "wearables" | "cameras";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  /** Storage capacity, for devices where it is a buying attribute. */
  storage?: string;
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
  /** Longer description shown on the product page. */
  description?: string;
  /** Explicit specification groups. When absent, a table is derived from the fields above. */
  specGroups?: SpecGroup[];
  /**
   * Selectable options that are purely presentational (e.g. colour). They never change
   * price or stock: a variant with its own price or stock needs its own product record.
   */
  variants?: VariantGroup[];
};

export type SpecRow = { label: string; value: string };
export type SpecGroup = { title: string; rows: SpecRow[] };

export type VariantOption = { id: string; label: string };
export type VariantGroup = { id: string; label: string; options: VariantOption[] };
