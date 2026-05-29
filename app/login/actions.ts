"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** Prefer live request URL so OAuth redirect matches the host the coach used (localhost vs prod domain, port, etc.). */
function getSiteUrlFromRequest(headerStore: Headers): string {
  const origin = headerStore.get("origin");
  if (origin) {
    return origin;
  }

  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const proto = forwardedProto && forwardedProto.length > 0 ? forwardedProto : "https";
    return `${proto}://${host}`;
  }

  const host = headerStore.get("host");
  if (host) {
    const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    return `${local ? "http" : "https"}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Start the Google OAuth flow. Supabase returns a provider URL we redirect the coach to. */
export async function signInWithGoogle() {
  const headerStore = await headers();
  const origin = getSiteUrlFromRequest(headerStore);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: new URL("/auth/callback", origin).toString(),
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!data?.url) {
    redirect("/login?error=Could%20not%20start%20Google%20sign-in.%20Try%20again.");
  }

  redirect(data.url);
}

/** Email + password sign-in for coaches without a Google account. */
export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

/** Email + password sign-up. With Supabase "Confirm email" OFF this returns a live session immediately. */
export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required.");
  }

  if (password.length < 8) {
    redirect("/login?error=Password%20must%20be%20at%20least%208%20characters.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // "Confirm email" OFF → a session is created and the coach is signed in.
  if (data?.session) {
    redirect("/app");
  }

  // "Confirm email" ON → no session yet; coach must confirm via email first.
  redirect("/login?success=Account%20created.%20Check%20your%20email%20to%20confirm%2C%20then%20sign%20in.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
