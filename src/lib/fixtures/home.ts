import { Camera, Gamepad2, Headphones, Laptop, Smartphone, Tv, Watch, Zap, Truck, BadgePercent, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/components/products/CategoryCard";

/** Homepage copy and sample data. Placeholder content until the real catalogue exists. */

export const departments: Category[] = [
  { slug: "smartphones", name: "Smartphones", description: "Phones & tablets", icon: Smartphone },
  { slug: "laptops", name: "Laptops", description: "Ultrabooks & gaming", icon: Laptop },
  { slug: "audio", name: "Audio", description: "Headphones & speakers", icon: Headphones },
  { slug: "tvs", name: "TVs", description: "OLED & 4K screens", icon: Tv },
  { slug: "gaming", name: "Gaming", description: "Consoles & accessories", icon: Gamepad2 },
  { slug: "wearables", name: "Wearables", description: "Watches & trackers", icon: Watch },
  { slug: "cameras", name: "Cameras", description: "Photo & video gear", icon: Camera },
];

export const trustItems: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Truck, title: "Delivery across the Kingdom", text: "Options shown at checkout" },
  { icon: BadgePercent, title: "Prices in SAR", text: "Clear totals, VAT shown" },
  { icon: Zap, title: "Flexible payments", text: "Payment options coming soon" },
  { icon: LifeBuoy, title: "Customer care", text: "Support channels coming soon" },
];

export type PromoItem = {
  id: string;
  eyebrow: string;
  eyebrowTone: "danger" | "brand";
  meta: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageLabel: string;
  icon: LucideIcon;
  linkLabel: string;
};

export const promos: PromoItem[] = [
  {
    id: "promo-laptop",
    eyebrow: "Special offer",
    eyebrowTone: "danger",
    meta: "Computing",
    title: "Pro laptop 16-inch",
    description: "Liquid-retina class display, dark finish, 36GB memory.",
    price: 7999,
    imageLabel: "Laptop on a neutral backdrop",
    icon: Laptop,
    linkLabel: "Explore computing",
  },
  {
    id: "promo-audio",
    eyebrow: "Editor's choice",
    eyebrowTone: "brand",
    meta: "30h battery",
    title: "Studio headphones",
    description: "Adaptive noise cancelling for travel and focus.",
    price: 1149,
    compareAtPrice: 1399,
    imageLabel: "Over-ear headphones on a neutral backdrop",
    icon: Headphones,
    linkLabel: "Explore audio",
  },
];

export const deal = {
  title: "65-inch OLED 4K television",
  description: "Self-lit OLED pixels, 120Hz refresh and Dolby Vision for cinema-style viewing at home.",
  price: 5899,
  compareAtPrice: 7999,
  note: "Prices include VAT.",
};
