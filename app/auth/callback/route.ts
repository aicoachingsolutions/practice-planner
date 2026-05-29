import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/**
 * PKCE / OAuth code exchange must attach session cookies to the outgoing redirect.
 * Using `cookies()` from `next/headers` in a Route Handler does not reliably persist
 * Supabase session cookies — use `NextResponse` + `createServerClient` (same idea as middleware).
 * Handles the Google OAuth callback (and any other code-based flow).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    const missing = new URL("/login", url.origin);
    missing.searchParams.set("error", "Missing sign-in code. Try signing in again.");
    return NextResponse.redirect(missing);
  }

  const redirectSuccess = NextResponse.redirect(new URL("/app", url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectSuccess.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const fail = new URL("/login", url.origin);
      fail.searchParams.set("error", error.message);
      return NextResponse.redirect(fail);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign-in failed. Try signing in again.";
    const fail = new URL("/login", url.origin);
    fail.searchParams.set("error", message);
    return NextResponse.redirect(fail);
  }

  return redirectSuccess;
}
