"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Check, Info, ShoppingBag } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { RadioCardGroup, SelectField, TextField } from "@/components/checkout/CheckoutFields";
import { CheckoutSummary, Money } from "@/components/checkout/CheckoutSummary";
import { useShopping } from "@/components/shopping/useShopping";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { announce } from "@/lib/announcer";
import { submitDemoOrder, type SubmitResult } from "@/lib/checkout-submit";
import {
  CITIES,
  COUNTRIES,
  DELIVERY_METHODS,
  EMPTY_FORM,
  FIELD_LIMITS,
  PAYMENT_METHODS,
  cartSignature,
  firstInvalidField,
  validateCheckoutForm,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutForm,
} from "@/lib/checkout";
import { generateSubmissionId } from "@/lib/demo-orders";
import { resolveCart, summarizeCart } from "@/lib/shopping";

/** Simulated processing time so progress is visible; nothing is sent anywhere. */
const PROCESSING_MS = 600;

const card = "rounded-2xl bg-card p-5 shadow-card sm:p-6";

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  const id = `checkout-section-${number}`;
  return (
    <section aria-labelledby={id} className={card}>
      <h2 id={id} className="flex items-center gap-3 font-heading text-headline-md text-ink">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-label-lg text-brand"
        >
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Steps() {
  const step = "flex items-center gap-2 text-label-lg";
  const dot = "flex size-7 items-center justify-center rounded-full text-label-md";
  return (
    <ol aria-label="Checkout steps" className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <li className={step}>
        <span className={`${dot} bg-brand text-brand-on`}>
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        </span>
        <Link href="/cart" className="text-ink-muted underline-offset-4 hover:text-ink hover:underline">
          Cart
        </Link>
      </li>
      <li aria-current="step" className={`${step} text-ink`}>
        <span className={`${dot} bg-brand text-brand-on`}>2</span>
        Checkout
      </li>
      <li className={`${step} text-ink-subtle`}>
        <span className={`${dot} bg-surface-2 text-ink-slate`}>3</span>
        Confirmation
      </li>
    </ol>
  );
}

function EmptyCheckout() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <ShoppingBag size={30} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-heading text-headline-md text-ink">Your cart is empty</h2>
      <p className="mt-2 max-w-sm text-body-md text-ink-slate">Add products to your cart before starting checkout.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/cart" variant="outline" size="lg">
          Return to cart
        </ButtonLink>
        <ButtonLink href="/products" size="lg" trailingIcon={<ArrowRight size={18} aria-hidden="true" />}>
          Browse products
        </ButtonLink>
      </div>
    </div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { ready, cart } = useShopping();
  const resolved = useMemo(() => resolveCart(cart), [cart]);

  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [failure, setFailure] = useState<Extract<SubmitResult, { ok: false }> | null>(null);
  // Created on first submit and kept for this visit: a repeated submit reuses it, so no second order is created.
  const submissionIdRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const failureRef = useRef<HTMLDivElement>(null);

  function set<K extends CheckoutField>(field: K, value: CheckoutForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function focusField(field: CheckoutField) {
    document.querySelector<HTMLElement>(`[data-field="${field}"]`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const found = validateCheckoutForm(form);
    setErrors(found);
    const first = firstInvalidField(found);
    if (first) {
      const count = Object.keys(found).length;
      announce(`${count} ${count === 1 ? "field needs" : "fields need"} attention.`);
      focusField(first);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFailure(null);
    announce("Creating your demo order.");
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_MS));

    const result = submitDemoOrder({
      shownSignature: cartSignature(resolved),
      submissionId: (submissionIdRef.current ??= generateSubmissionId()),
      paymentMethodId: form.paymentMethod,
      deliveryMethodId: form.deliveryMethod,
    });

    if (!result.ok) {
      submittingRef.current = false;
      setSubmitting(false);
      setFailure(result);
      announce(result.message);
      requestAnimationFrame(() => failureRef.current?.focus());
      return;
    }

    // Keep the form locked and show progress until the confirmation page takes over,
    // so the now-empty cart is never flashed as an error.
    setCompletedId(result.order.id);
    announce("Demo order created. Opening your confirmation.");
    router.push(`/order-confirmation/${result.order.id}`);
  }

  const heading = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-headline-xl text-ink">
          Checkout
        </h1>
        <Badge tone="neutral">Demo checkout</Badge>
      </div>
      <div className="mt-4">
        <Steps />
      </div>
      <p className="mt-4 flex gap-2 rounded-xl bg-surface-1 p-4 text-body-sm text-ink-muted" role="note">
        <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
        <span>
          This is a demo checkout. No payment is taken, nothing is shipped and no confirmation email is sent. Use
          fictional details only: your name, email, phone and address are not saved.
        </span>
      </p>
    </>
  );

  if (!ready) {
    return (
      <>
        {heading}
        <p role="status" className="mt-6 rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
          Loading your checkout…
        </p>
      </>
    );
  }

  if (completedId) {
    return (
      <>
        {heading}
        <p role="status" className="mt-6 rounded-2xl bg-card p-8 text-center text-body-md text-ink-slate shadow-card">
          Demo order created. Opening your confirmation…
        </p>
      </>
    );
  }

  if (resolved.length === 0) {
    return (
      <>
        {heading}
        <div className="mt-6">
          <EmptyCheckout />
        </div>
      </>
    );
  }

  const summary = summarizeCart(resolved);
  const errorCount = Object.keys(errors).length;

  return (
    <>
      {heading}
      <p className="mt-4 text-body-md text-ink-muted lg:hidden">
        {summary.itemCount} {summary.itemCount === 1 ? "item" : "items"} · Estimated{" "}
        <Money halalas={summary.estimatedTotalHalalas} className="font-semibold text-ink" />
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <form id="checkout-form" noValidate onSubmit={onSubmit} aria-label="Demo checkout details" className="space-y-6">
          {errorCount > 0 ? (
            <div role="alert" className="flex gap-2 rounded-xl bg-danger-soft p-4 text-body-sm text-danger-ink">
              <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              <p>
                {errorCount} {errorCount === 1 ? "field needs" : "fields need"} attention. Fix the highlighted fields and
                try again.
              </p>
            </div>
          ) : null}

          <Section number={1} title="Contact details">
            <TextField
              field="fullName"
              label="Full name"
              required
              autoComplete="name"
              maxLength={FIELD_LIMITS.fullName.max + 20}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              error={errors.fullName}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                field="email"
                label="Email address"
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={FIELD_LIMITS.email.max + 20}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
              />
              <TextField
                field="phone"
                label="Mobile number"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                placeholder="05X XXX XXXX"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                error={errors.phone}
                hint="Saudi mobile number."
              />
            </div>
            <p className="text-label-md font-normal text-ink-subtle">
              Not saved with your demo order and not used to send anything.
            </p>
          </Section>

          <Section number={2} title="Delivery address">
            <TextField
              field="recipientName"
              label="Recipient name, if different"
              autoComplete="shipping name"
              maxLength={FIELD_LIMITS.recipientName.max + 20}
              value={form.recipientName}
              onChange={(e) => set("recipientName", e.target.value)}
              error={errors.recipientName}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                field="country"
                label="Country"
                autoComplete="country"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                error={errors.country}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.label}
                  </option>
                ))}
              </SelectField>
              <SelectField
                field="city"
                label="City"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                error={errors.city}
              >
                <option value="">Select a city</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextField
              field="address"
              label="District and street"
              required
              autoComplete="address-line1"
              maxLength={FIELD_LIMITS.address.max + 20}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              error={errors.address}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                field="building"
                label="Building, villa or apartment"
                required
                autoComplete="address-line2"
                maxLength={FIELD_LIMITS.building.max + 20}
                value={form.building}
                onChange={(e) => set("building", e.target.value)}
                error={errors.building}
              />
              <TextField
                field="postalCode"
                label="Postal code"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={10}
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                error={errors.postalCode}
                hint="5 digits."
              />
            </div>
            <p className="text-label-md font-normal text-ink-subtle">
              Not saved with your demo order. Use a fictional address.
            </p>
            <RadioCardGroup
              field="deliveryMethod"
              legend="Delivery method"
              options={DELIVERY_METHODS}
              value={form.deliveryMethod}
              onChange={(id) => set("deliveryMethod", id)}
              error={errors.deliveryMethod}
            />
          </Section>

          <Section number={3} title="Payment">
            <RadioCardGroup
              field="paymentMethod"
              legend="Simulated payment option"
              options={PAYMENT_METHODS}
              value={form.paymentMethod}
              onChange={(id) => set("paymentMethod", id)}
              error={errors.paymentMethod}
            />
            <p className="flex gap-2 rounded-xl bg-surface-1 p-4 text-body-sm text-ink-muted">
              <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
              <span>
                Simulated payment only. No card number, expiry, security code or bank details are asked for, and nothing
                is charged, authorised or settled.
              </span>
            </p>
          </Section>

          {failure ? (
            <div
              ref={failureRef}
              tabIndex={-1}
              role="alert"
              className="flex flex-col gap-3 rounded-xl bg-danger-soft p-4 text-body-sm text-danger-ink outline-none"
            >
              <p className="flex gap-2">
                <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>{failure.message}</span>
              </p>
              <div>
                <ButtonLink href="/cart" variant="outline" size="sm">
                  Return to cart
                </ButtonLink>
              </div>
            </div>
          ) : null}
        </form>

        <CheckoutSummary
          resolved={resolved}
          action={
            <>
              <Button
                type="submit"
                form="checkout-form"
                fullWidth
                size="lg"
                disabled={submitting}
              >
                {submitting ? "Creating demo order…" : "Place demo order"}
              </Button>
              <p className="mt-2 text-center text-label-md font-normal text-ink-slate">
                Creates a demo order in this browser only.
              </p>
              <ButtonLink href="/cart" variant="ghost" fullWidth className="mt-3">
                Return to cart
              </ButtonLink>
            </>
          }
        />
      </div>
    </>
  );
}
