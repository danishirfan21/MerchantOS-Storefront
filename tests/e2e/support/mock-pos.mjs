// Controlled, deterministic stand-in for the POS Storefront catalog API, used only by browser tests.
// It is intentionally "leaky": it adds fields the real contract forbids (sku, stock, id) so the
// tests can prove the Storefront never passes unexpected fields through to the browser.
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_POS_PORT ?? 4010);

const products = [
  { slug: "iphone-15-pro", name: "Mock Phone Pro", category: { slug: "smartphones", label: "Smartphones" }, priceHalalas: 429900, availability: "in-stock", sku: "SECRET-SKU-PH1", stock: 77, id: "p01" },
  { slug: "airpods-pro-2nd-gen", name: "Mock Earbuds", category: { slug: "audio", label: "Audio" }, priceHalalas: 94950, availability: "low-stock", sku: "SECRET-SKU-AU6", stock: 3, id: "p06" },
  { slug: "apple-watch-ultra-2", name: "Mock Watch", category: { slug: "wearables", label: "Wearables" }, priceHalalas: 319900, availability: "out-of-stock", sku: "SECRET-SKU-WR11", stock: 0, id: "p11" },
].map((p) => ({ ...p, currency: "SAR", vatTreatment: "excluded" }));

let lastHeaders = {};

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  if (req.method !== "GET") return send(res, 405, { code: "method_not_allowed" });
  if (url.pathname === "/__headers") return send(res, 200, lastHeaders);
  if (url.pathname === "/__health") return send(res, 200, { ok: true });
  if (url.pathname.startsWith("/api/storefront/")) lastHeaders = req.headers;

  if (url.pathname === "/api/storefront/products") {
    const term = (url.searchParams.get("search") ?? "").toLowerCase();
    if (term.length > 64) return send(res, 400, { code: "invalid_request", message: "bad search" });
    const items = products.filter((p) => !term || p.name.toLowerCase().includes(term));
    return send(res, 200, { items, page: 1, pageSize: 12, total: items.length });
  }
  const match = /^\/api\/storefront\/products\/([a-z0-9-]+)$/.exec(url.pathname);
  if (match) {
    const found = products.find((p) => p.slug === match[1]);
    return found ? send(res, 200, found) : send(res, 404, { code: "not_found", message: "Product not found." });
  }
  return send(res, 404, { code: "not_found", message: "Not found." });
}).listen(PORT, "127.0.0.1", () => console.log(`mock POS listening on ${PORT}`));
