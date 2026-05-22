"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { copyStarterDrillSetForNewTeam } from "@/app/app/drills/actions";

export async function createTeamAndSeason(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const teamName = String(formData.get("team_name") ?? "").trim();
  const sportKey = String(formData.get("sport_key") ?? "").trim();
  const seasonName = String(formData.get("season_name") ?? "").trim();

  if (!teamName || !sportKey || !seasonName) {
    redirect("/app?error=Team%20name,%20sport,%20and%20season%20name%20are%20required.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name:
          user.user_metadata.full_name ??
          user.user_metadata.name ??
          null,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

  if (profileError || !profile) {
    redirect(
      `/app?error=${encodeURIComponent(
        profileError?.message ?? "Unable to create profile.",
      )}`,
    );
  }

  const { data: sports, error: sportsError } = await supabase
    .from("sport_configs")
    .select("sport_key")
    .eq("sport_key", sportKey)
    .eq("is_active", true)
    .maybeSingle();

  if (sportsError || !sports) {
    redirect("/app?error=Select%20a%20valid%20sport.");
  }

  const { count, error: teamCountError } = await supabase
    .from("teams")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", user.id);

  if (teamCountError) {
    redirect(`/app?error=${encodeURIComponent(teamCountError.message)}`);
  }

  if ((count ?? 0) >= 1) {
    redirect("/app");
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      owner_user_id: user.id,
      name: teamName,
      sport_key: sportKey,
    })
    .select("id")
    .single();

  if (teamError || !team) {
    redirect(
      `/app?error=${encodeURIComponent(
        teamError?.message ?? "Unable to create team.",
      )}`,
    );
  }

  const { error: seasonError } = await supabase.from("seasons").insert({
    team_id: team.id,
    name: seasonName,
    is_active: true,
  });

  if (seasonError) {
    redirect(`/app?error=${encodeURIComponent(seasonError.message)}`);
  }

  try {
    await copyStarterDrillSetForNewTeam(user.id, sportKey);
  } catch (error) {
    console.error("Failed to copy starter drill set for new team", error);
  }

  revalidatePath("/app");
  redirect("/app");
}
