"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app", label: "Home", match: (path: string) => path === "/app" },
  { href: "/app/practices", label: "Practices", match: (path: string) => path.startsWith("/app/practices") },
  { href: "/app/drills", label: "Drills", match: (path: string) => path.startsWith("/app/drills") },
  { href: "/app/library", label: "Library", match: (path: string) => path.startsWith("/app/library") },
] as const;

export function AppTabNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="app-tab-bar" aria-label="Main">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`app-tab-bar__link${active ? " app-tab-bar__link--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
