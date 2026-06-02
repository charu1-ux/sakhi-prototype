import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rewrite ALL /jobs/design-prototype/... page requests to the jobs dev server
 * before the shell's app router processes them. This ensures jobs React
 * hydrates cleanly without shell React interference.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/jobs/design-prototype") &&
    !pathname.includes("/_next/") &&
    !pathname.includes("/assets/") &&
    !pathname.endsWith(".html") &&
    !pathname.endsWith(".json") &&
    !pathname.endsWith(".css") &&
    !pathname.endsWith(".js") &&
    !pathname.endsWith(".svg") &&
    !pathname.endsWith(".png")
  ) {
    const dest = new URL(`http://localhost:3003${pathname}${request.nextUrl.search}`);
    return NextResponse.rewrite(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/jobs/design-prototype/:path*",
};
