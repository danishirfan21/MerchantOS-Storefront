/**
 * Narrow customer-safe product model returned by the POS Storefront catalog API.
 *
 * This is deliberately not the Storefront `Product` type: the POS has no brand, images,
 * descriptions, specifications or variants, and none are invented here. Prices are integer
 * halalas (SAR x 100) and are **excluded of VAT** (the POS adds 15% VAT at checkout).
 */

export type ApiAvailability = "in-stock" | "low-stock" | "out-of-stock";

export type ApiProduct = {
  /** Public slug, the only identifier the Storefront ever sees. */
  slug: string;
  name: string;
  category: { slug: string; label: string };
  priceHalalas: number;
  currency: "SAR";
  vatTreatment: "excluded";
  availability: ApiAvailability;
};

export type ApiProductList = {
  items: ApiProduct[];
  page: number;
  pageSize: number;
  total: number;
};

export type ApiQuery = {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
};
