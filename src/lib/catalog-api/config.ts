/**
 * Server-only catalog configuration.
 *
 * `MERCHANTOS_CATALOG_SOURCE` selects where the live-catalog preview reads from:
 *   - `fixture` (default): nothing is fetched; the original fictional catalogue keeps working.
 *   - `api`: the preview routes read the customer-safe POS catalog through server-side requests.
 *
 * None of these variables may use a `NEXT_PUBLIC_` prefix: the backend address is private and must
 * never reach browser code. Error messages name variables but never echo their values.
 * This module has no path-alias imports so `next.config.ts` can validate it at startup.
 */

export type CatalogConfig =
  | { source: "fixture" }
  | { source: "api"; baseUrl: string; timeoutMs: number };

export class CatalogConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogConfigError";
  }
}

export const SOURCE_VARIABLE = "MERCHANTOS_CATALOG_SOURCE";
export const URL_VARIABLE = "MERCHANTOS_CATALOG_API_URL";
export const TIMEOUT_VARIABLE = "MERCHANTOS_CATALOG_API_TIMEOUT_MS";

export const DEFAULT_TIMEOUT_MS = 4000;
const MIN_TIMEOUT_MS = 500;
const MAX_TIMEOUT_MS = 15000;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

type Env = Record<string, string | undefined>;

function parseBaseUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new CatalogConfigError(`${URL_VARIABLE} must be an absolute http(s) URL.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new CatalogConfigError(`${URL_VARIABLE} must use http or https.`);
  }
  if (url.protocol === "http:" && !LOOPBACK_HOSTS.has(url.hostname)) {
    throw new CatalogConfigError(`${URL_VARIABLE} may use plain http only for localhost; use https otherwise.`);
  }
  if (url.username || url.password) {
    throw new CatalogConfigError(`${URL_VARIABLE} must not contain credentials.`);
  }
  if ((url.pathname !== "/" && url.pathname !== "") || url.search || url.hash) {
    throw new CatalogConfigError(`${URL_VARIABLE} must be an origin only (no path, query or fragment).`);
  }
  return url.origin;
}

export function readCatalogConfig(env: Env = process.env): CatalogConfig {
  const source = (env[SOURCE_VARIABLE] ?? "").trim();
  if (source === "" || source === "fixture") return { source: "fixture" };
  if (source !== "api") {
    throw new CatalogConfigError(`${SOURCE_VARIABLE} must be "fixture" or "api".`);
  }

  const rawUrl = (env[URL_VARIABLE] ?? "").trim();
  if (rawUrl === "") {
    throw new CatalogConfigError(`${URL_VARIABLE} is required when ${SOURCE_VARIABLE}=api.`);
  }
  const baseUrl = parseBaseUrl(rawUrl);

  const rawTimeout = (env[TIMEOUT_VARIABLE] ?? "").trim();
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  if (rawTimeout !== "") {
    const parsed = Number(rawTimeout);
    if (!Number.isInteger(parsed) || parsed < MIN_TIMEOUT_MS || parsed > MAX_TIMEOUT_MS) {
      throw new CatalogConfigError(`${TIMEOUT_VARIABLE} must be a whole number from ${MIN_TIMEOUT_MS} to ${MAX_TIMEOUT_MS}.`);
    }
    timeoutMs = parsed;
  }
  return { source: "api", baseUrl, timeoutMs };
}
