"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** Prefer live request URL so magic-link redirect matches the host the coach used (localhost vs 127.0.0.1, port, etc.). */
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

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect("/login?error=Email%20is%20required.");
  }

  const headerStore = await headers();
  const origin = getSiteUrlFromRequest(headerStore);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: new URL("/auth/callback", origin).toString(),
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?success=Check%20your%20email%20for%20the%20sign-in%20link.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
