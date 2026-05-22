import { AppTabNav } from "@/components/app-tab-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-shell__main">{children}</div>
      <AppTabNav />
    </div>
  );
}
