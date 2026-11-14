import { CatalogConfigError, readCatalogConfig, type CatalogConfig } from "@/lib/catalog-api/config";
import { isPublicSlug, parseApiProduct, parseApiProductList } from "@/lib/catalog-api/parse";
import type { ApiProduct, ApiProductList, ApiQuery } from "@/lib/catalog-api/types";

/**
 * Server-side read-only client for the POS Storefront catalog. It must only be imported from
 * Server Components or route handlers. It never forwards cookies or credentials, never follows
 * redirects, never throws to the UI, and never returns fixture data on failure.
 */

export type CatalogResult<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" }
  | { status: "invalid-request" }
  | { status: "rate-limited" }
  | { status: "unavailable" }
  | { status: "invalid-response" }
  | { status: "disabled" }
  | { status: "misconfigured" };

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const MAX_BODY_CHARS = 200_000;

async function request<T>(
  config: Extract<CatalogConfig, { source: "api" }>,
  path: string,
  parse: (raw: unknown) => T | null,
  fetchImpl: FetchLike,
): Promise<CatalogResult<T>> {
  let response: Response;
  try {
    response = await fetchImpl(`${config.baseUrl}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      credentials: "omit",
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 404) return { status: "not-found" };
  if (response.status === 400) return { status: "invalid-request" };
  if (response.status === 429) return { status: "rate-limited" };
  if (!response.ok) return { status: "unavailable" };

  try {
    const body = await response.text();
    if (body.length > MAX_BODY_CHARS) return { status: "invalid-response" };
    const parsed = parse(JSON.parse(body));
    return parsed === null ? { status: "invalid-response" } : { status: "ok", data: parsed };
  } catch {
    return { status: "invalid-response" };
  }
}

function resolve(env?: Record<string, string | undefined>): CatalogConfig | "misconfigured" {
  try {
    return readCatalogConfig(env);
  } catch (error) {
    if (error instanceof CatalogConfigError) return "misconfigured";
    throw error;
  }
}

export function listQueryString(query: ApiQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize));
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function loadApiProducts(
  query: ApiQuery = {},
  options: { env?: Record<string, string | undefined>; fetchImpl?: FetchLike } = {},
): Promise<CatalogResult<ApiProductList>> {
  const config = resolve(options.env);
  if (config === "misconfigured") return { status: "misconfigured" };
  if (config.source !== "api") return { status: "disabled" };
  return request(config, `/api/storefront/products${listQueryString(query)}`, parseApiProductList, options.fetchImpl ?? fetch);
}

export async function loadApiProduct(
  slug: string,
  options: { env?: Record<string, string | undefined>; fetchImpl?: FetchLike } = {},
): Promise<CatalogResult<ApiProduct>> {
  const config = resolve(options.env);
  if (config === "misconfigured") return { status: "misconfigured" };
  if (config.source !== "api") return { status: "disabled" };
  // A slug that cannot be valid is never sent to the backend.
  if (!isPublicSlug(slug)) return { status: "not-found" };
  return request(config, `/api/storefront/products/${slug}`, parseApiProduct, options.fetchImpl ?? fetch);
}
