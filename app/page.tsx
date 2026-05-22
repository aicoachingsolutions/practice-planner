import { redirect } from "next/navigation";
import { LandingPage } from "@/components/marketing/landing-page";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app");
  }
  return <LandingPage />;
}
