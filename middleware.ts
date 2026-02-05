import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "wedding_access"
const INVITE_CODE_PAGE = "/"

// Routes that don't require wedding_access cookie (gate is at /; access granted after RSVP)
const PUBLIC_ROUTES = [
  "/api/verify-invite",
  "/api/auth",
  "/api/rsvp", // RSVP submit, grant-access, lookup
  "/admin",
  "/_next",
  "/favicon.ico",
  "/rsvp", // RSVP pages (lookup, form) – user gets cookie after submitting
  "/videos", // Video files for splash page
]

// Static assets in public/ (splash image, videos, etc.) – allow so gate page can load them
const isStaticAsset = (pathname: string) =>
  /\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|mp4|webm)$/i.test(pathname)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes, root page (RSVP gate), and static assets (splash image)
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname === INVITE_CODE_PAGE ||
    isStaticAsset(pathname)
  ) {
    return NextResponse.next()
  }

  // TEMPORARILY DISABLED: RSVP gate - allowing all routes for now
  // TODO: Re-enable when you want to require invite codes
  // In development, skip the gate so you can access the wedding site directly (e.g. localhost:3000/slug)
  // if (process.env.NODE_ENV === "development") {
  //   return NextResponse.next()
  // }

  // // Check for access cookie
  // const hasAccess = request.cookies.has(COOKIE_NAME)

  // // If no access, redirect to RSVP gate
  // if (!hasAccess) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = INVITE_CODE_PAGE
  //   return NextResponse.redirect(url)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
