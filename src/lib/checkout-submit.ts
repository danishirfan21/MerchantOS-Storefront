/**
 * Demo order submission. Plain functions, no React, so a real backend call could replace
 * the body later without touching components.
 *
 * Order of operations: reuse an existing order for the same submission, reload and
 * revalidate the cart, compare it with what the shopper was shown, create the snapshot,
 * persist it, and only then remove the purchased lines from the cart.
 *
 * Idempotency is client-side only: a per-checkout submission id means a repeated submit
 * returns the order already created. It cannot stop a shopper who deliberately starts a
 * second checkout in another tab or browser, and a real backend must enforce its own
 * idempotency keys.
 */
import { cartSignature, checkCartLines } from "@/lib/checkout";
import { createDemoOrder, generateOrderId, isSubmissionId, type DemoOrder } from "@/lib/demo-orders";
import { findDemoOrder, findDemoOrderBySubmission, saveDemoOrder } from "@/lib/demo-order-store";
import { resolveCart } from "@/lib/shopping";
import { reloadShoppingState, removePurchasedLines } from "@/lib/shopping-store";

export type SubmitFailure = "empty" | "unavailable" | "changed" | "invalid" | "storage";

export type SubmitResult =
  | { ok: true; order: DemoOrder; reused: boolean; cartCleared: boolean }
  | { ok: false; reason: SubmitFailure; message: string };

export type SubmitInput = {
  /** `cartSignature` of the cart the shopper was looking at. */
  shownSignature: string;
  submissionId: string;
  paymentMethodId: string;
  deliveryMethodId: string;
};

export const SUBMIT_MESSAGES: Record<SubmitFailure, string> = {
  empty: "Your cart is empty, so there is nothing to order.",
  unavailable: "Some items in your cart are no longer available. Review your cart and try again.",
  changed: "Your cart changed since you opened checkout. Review it before placing the demo order.",
  invalid: "The selected delivery or payment option is not valid. Choose one and try again.",
  storage: "The demo order could not be saved in this browser, so nothing was created and your cart is unchanged. Check that storage is allowed and try again.",
};

function fail(reason: SubmitFailure): SubmitResult {
  return { ok: false, reason, message: SUBMIT_MESSAGES[reason] };
}

function uniqueOrderId(): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateOrderId();
    if (!findDemoOrder(id)) return id;
  }
  return generateOrderId();
}

export function submitDemoOrder(input: SubmitInput): SubmitResult {
  if (!isSubmissionId(input.submissionId)) return fail("invalid");

  const existing = findDemoOrderBySubmission(input.submissionId);
  if (existing) return { ok: true, order: existing, reused: true, cartCleared: true };

  const cart = reloadShoppingState().cart;
  if (cart.length === 0) return fail("empty");
  if (checkCartLines(cart).length > 0) return fail("unavailable");

  const resolved = resolveCart(cart);
  if (cartSignature(resolved) !== input.shownSignature) return fail("changed");

  let order: DemoOrder;
  try {
    order = createDemoOrder({
      id: uniqueOrderId(),
      submissionId: input.submissionId,
      resolved,
      paymentMethodId: input.paymentMethodId,
      deliveryMethodId: input.deliveryMethodId,
    });
  } catch {
    return fail("invalid");
  }

  if (!saveDemoOrder(order).ok) return fail("storage");

  const cartCleared = removePurchasedLines(cart);
  return { ok: true, order, reused: false, cartCleared };
}
