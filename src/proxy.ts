import { NextResponse, type NextRequest } from "next/server";
import { getProductBySlug } from "@/lib/products";

/**
 * With Cache Components an unknown product slug would stream the not-found UI after a 200
 * status. Rewriting unknown slugs to a path that does not exist makes the response a real 404.
 */
export function proxy(request: NextRequest) {
  const slug = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  if (!getProductBySlug(slug)) {
    return NextResponse.rewrite(new URL("/product-not-found", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/products/:slug" };
