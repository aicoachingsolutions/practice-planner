"use client";

import { useState } from "react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/login/actions";

export function LoginForm({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="auth-form">
      {/* Google OAuth — one tap, no email needed */}
      <form action={signInWithGoogle}>
        <button className="button auth-google-button" type="submit">
          Continue with Google
        </button>
      </form>

      <div className="auth-divider">
        <span>or use email</span>
      </div>

      {/* Email + password */}
      <form action={mode === "signin" ? signInWithPassword : signUpWithPassword} className="form-grid">
        <label className="label">
          Email
          <input
            className="input"
            type="email"
            name="email"
            placeholder="coach@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="label">
          Password
          <input
            className="input"
            type="password"
            name="password"
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
          />
        </label>

        <button className="button" type="submit">
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        className="auth-toggle"
        onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin"
          ? "New coach? Create an account"
          : "Already have an account? Sign in"}
      </button>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}
    </div>
  );
}
