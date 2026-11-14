/**
 * Pure checkout logic: the demo options, form validation and cart eligibility checks.
 *
 * Browser-local demo only. The form values below are held in component state while the
 * form is open and are never stored, logged or put into an order record. There are no
 * card, bank or other payment credential fields anywhere in this flow.
 */
import { getProductById, isPurchasable, maxQuantity } from "@/lib/products";
import { lineKey, normalizeVariants, resolveCart, type CartLine, type ResolvedLine } from "@/lib/shopping";

/* ------------------------------ options ------------------------------ */

export const DELIVERY_METHODS = [
  {
    id: "standard",
    label: "Standard delivery (demo)",
    description: "A simulated option. No courier, charge or delivery date is implied.",
  },
  {
    id: "scheduled",
    label: "Scheduled delivery (demo)",
    description: "A simulated option for choosing a convenient time later. Nothing is booked.",
  },
] as const;

export const PAYMENT_METHODS = [
  {
    id: "demo-cod",
    label: "Demo cash on delivery",
    description: "Nothing is charged. This only records which option you picked in the demo.",
  },
  {
    id: "demo-card",
    label: "Simulated card payment",
    description: "No card details are collected or processed, and no payment is made.",
  },
] as const;

export type DeliveryMethodId = (typeof DELIVERY_METHODS)[number]["id"];
export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export function deliveryMethodLabel(id: string): string | undefined {
  return DELIVERY_METHODS.find((method) => method.id === id)?.label;
}

export function paymentMethodLabel(id: string): string | undefined {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label;
}

export const COUNTRIES = [{ id: "SA", label: "Saudi Arabia" }] as const;

export const CITIES = ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Al Khobar", "Tabuk", "Abha"] as const;

/* ------------------------------- form -------------------------------- */

export const FIELD_LIMITS = {
  fullName: { min: 2, max: 80 },
  recipientName: { max: 80 },
  email: { max: 254 },
  address: { min: 5, max: 120 },
  building: { min: 1, max: 60 },
} as const;

export type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  recipientName: string;
  country: string;
  city: string;
  address: string;
  building: string;
  postalCode: string;
  deliveryMethod: string;
  paymentMethod: string;
};

export type CheckoutField = keyof CheckoutForm;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** Visual and focus order of the fields. */
export const FIELD_ORDER: CheckoutField[] = [
  "fullName",
  "email",
  "phone",
  "recipientName",
  "country",
  "city",
  "address",
  "building",
  "postalCode",
  "deliveryMethod",
  "paymentMethod",
];

export const EMPTY_FORM: CheckoutForm = {
  fullName: "",
  email: "",
  phone: "",
  recipientName: "",
  country: "SA",
  city: "",
  address: "",
  building: "",
  postalCode: "",
  deliveryMethod: "",
  paymentMethod: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Saudi mobile numbers: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX. */
export function isSaudiMobile(value: string): boolean {
  const compact = value.replace(/[\s-]/g, "");
  return /^(?:\+966|00966|0)?5\d{8}$/.test(compact);
}

export function isPostalCode(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}

export function isEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length <= FIELD_LIMITS.email.max && EMAIL_PATTERN.test(trimmed);
}

/** Validates the whole form and returns one message per invalid field. */
export function validateCheckoutForm(form: CheckoutForm): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = form.fullName.trim();
  const address = form.address.trim();
  const building = form.building.trim();

  if (!name) errors.fullName = "Enter your full name.";
  else if (name.length < FIELD_LIMITS.fullName.min) errors.fullName = "Enter at least 2 characters.";
  else if (name.length > FIELD_LIMITS.fullName.max) errors.fullName = "Use 80 characters or fewer.";

  if (!form.email.trim()) errors.email = "Enter your email address.";
  else if (!isEmail(form.email)) errors.email = "Enter a valid email address, like name@example.com.";

  if (!form.phone.trim()) errors.phone = "Enter your mobile number.";
  else if (!isSaudiMobile(form.phone)) errors.phone = "Enter a Saudi mobile number, like 05X XXX XXXX.";

  if (form.recipientName.trim().length > FIELD_LIMITS.recipientName.max) {
    errors.recipientName = "Use 80 characters or fewer.";
  }

  if (!COUNTRIES.some((country) => country.id === form.country)) errors.country = "Choose a country.";

  if (!form.city) errors.city = "Choose a city.";
  else if (!(CITIES as readonly string[]).includes(form.city)) errors.city = "Choose a city from the list.";

  if (!address) errors.address = "Enter your district and street.";
  else if (address.length < FIELD_LIMITS.address.min) errors.address = "Enter at least 5 characters.";
  else if (address.length > FIELD_LIMITS.address.max) errors.address = "Use 120 characters or fewer.";

  if (!building) errors.building = "Enter a building, villa or apartment.";
  else if (building.length > FIELD_LIMITS.building.max) errors.building = "Use 60 characters or fewer.";

  if (!form.postalCode.trim()) errors.postalCode = "Enter your postal code.";
  else if (!isPostalCode(form.postalCode)) errors.postalCode = "Enter a 5-digit postal code.";

  if (!form.deliveryMethod) errors.deliveryMethod = "Choose a delivery method.";
  else if (!deliveryMethodLabel(form.deliveryMethod)) errors.deliveryMethod = "Choose one of the listed delivery methods.";

  if (!form.paymentMethod) errors.paymentMethod = "Choose a payment option.";
  else if (!paymentMethodLabel(form.paymentMethod)) errors.paymentMethod = "Choose one of the listed payment options.";

  return errors;
}

/** The first invalid field in visual order, so focus can move there. */
export function firstInvalidField(errors: CheckoutErrors): CheckoutField | undefined {
  return FIELD_ORDER.find((field) => errors[field]);
}

/* ---------------------------- cart checks ---------------------------- */

export type CartIssueCode = "empty" | "unknown-product" | "unavailable" | "invalid-variant" | "quantity";

export type CartIssue = { code: CartIssueCode; productId?: string; message: string };

/**
 * Checks raw cart lines against the catalogue without repairing anything, so problems are
 * reported rather than silently fixed: unknown products, out-of-stock products, variants
 * that do not exist, and quantities that are invalid or above the per-order limit.
 */
export function checkCartLines(lines: CartLine[]): CartIssue[] {
  if (lines.length === 0) return [{ code: "empty", message: "Your cart is empty." }];
  const issues: CartIssue[] = [];
  for (const line of lines) {
    const product = getProductById(line.productId);
    if (!product) {
      issues.push({ code: "unknown-product", productId: line.productId, message: "A product in your cart is no longer available." });
      continue;
    }
    if (!isPurchasable(product)) {
      issues.push({ code: "unavailable", productId: product.id, message: `${product.name} is out of stock.` });
      continue;
    }
    const repaired = normalizeVariants(product, line.variants);
    if (lineKey(product.id, repaired) !== lineKey(product.id, line.variants)) {
      issues.push({ code: "invalid-variant", productId: product.id, message: `The selected option for ${product.name} is no longer valid.` });
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > maxQuantity(product)) {
      issues.push({
        code: "quantity",
        productId: product.id,
        message: `The quantity of ${product.name} is above the limit of ${maxQuantity(product)} per order.`,
      });
    }
  }
  return issues;
}

/**
 * A compact fingerprint of what the shopper was shown: line identity, quantity and unit
 * price. Used to detect that the cart changed between viewing checkout and submitting.
 */
export function cartSignature(resolved: ResolvedLine[]): string {
  return resolved
    .map((item) => `${item.key}#${item.line.quantity}@${item.unitHalalas}`)
    .sort()
    .join(";");
}

export function signatureOf(lines: CartLine[]): string {
  return cartSignature(resolveCart(lines));
}
