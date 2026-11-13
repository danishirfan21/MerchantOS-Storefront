/**
 * Shared navigation data. An item with no `href` points at a page that is not
 * built yet; the UI renders it as a clearly disabled entry instead of a dead link.
 */
export type NavItem = {
  label: string;
  href?: string;
};

export const HOME_HREF = "/";

export const categoryNav: NavItem[] = [
  { label: "Smartphones" },
  { label: "Computing" },
  { label: "Audio" },
  { label: "Wearables" },
  { label: "Offers" },
];

export const footerGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Shop",
    items: [{ label: "All products" }, { label: "Smartphones" }, { label: "Computing" }, { label: "Audio" }],
  },
  {
    title: "Customer care",
    items: [{ label: "Help centre" }, { label: "Delivery" }, { label: "Returns" }, { label: "Warranty" }],
  },
  {
    title: "Account",
    items: [{ label: "My orders" }, { label: "Wishlist" }, { label: "Sign in" }],
  },
];

export const legalNav: NavItem[] = [{ label: "Privacy" }, { label: "Terms" }];

export const PENDING_HINT = "Available in a later release";
