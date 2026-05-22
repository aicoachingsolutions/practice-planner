"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeamForUser, getUserSubscriptionPlan } from "@/lib/data";
import { isMainPracticeGoalSlug, isValidPlacementZone } from "@/lib/drill-goal-model";

const drillTypes = new Set([
  "individual",
  "small_group",
  "team",
  "warmup",
  "competitive",
  "scrimmage",
  "conditioning",
]);

const frequencyRules = new Set([
  "none",
  "every_practice",
  "weekly_1",
  "weekly_2",
  "weekly_3",
]);

const starterDrillZoneTargets = [
  { zone: "warmup", count: 2 },
  { zone: "offense", count: 2 },
  { zone: "defense", count: 2 },
  { zone: "situational", count: 2 },
  { zone: "end_practice", count: 1 },
  { zone: "general", count: 1 },
] as const;

type StarterDrillSource = {
  id: string;
  sport_key: string;
  primary_goal_slug: string | null;
  placement_zone: string | null;
  name: string;
  drill_type: string;
  default_duration_minutes: number;
  priority: number;
  frequency: string;
  notes: string | null;
  player_count: string | null;
  equipment: string | null;
  setup_instructions: string | null;
  how_to_run: string | null;
  coaching_points: string | null;
  drill_tag_map?: Array<{ tag_id: string }>;
};

function derivePrimaryGoalSlugFromDrillType(drillType: string): string {
  if (drillType === "warmup") return "warmup";
  if (drillType === "conditioning") return "conditioning";
  if (drillType === "scrimmage") return "scrimmage";
  return "competitive";
}

function derivePlacementZoneFromGoalSlug(primaryGoalSlug: string): string {
  if (primaryGoalSlug === "warmup") return "warmup";
  if (primaryGoalSlug === "offense") return "offense";
  if (primaryGoalSlug === "defense") return "defense";
  if (primaryGoalSlug === "scrimmage") return "situational";
  return "general";
}

function resolvePrimaryGoalSlug(
  value: string | null | undefined,
  drillType: string,
): string {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized && isMainPracticeGoalSlug(normalized)) {
    return normalized;
  }
  return derivePrimaryGoalSlugFromDrillType(drillType);
}

type ParsedCoachDrillForm = {
  name: string;
  primaryGoalSlug: string;
  placementZone: string;
  drillType: string;
  duration: number;
  frequency: string;
  priorityFlag: boolean;
  notes: string;
  validTagIds: Set<string>;
};

type ParseCoachDrillFormResult =
  | { ok: true; data: ParsedCoachDrillForm }
  | { ok: false; message: string };

async function parseCoachDrillForm(
  supabase: Awaited<ReturnType<typeof createClient>>,
  team: { sport_key: string },
  formData: FormData,
): Promise<ParseCoachDrillFormResult> {
  const name = String(formData.get("name") ?? "").trim();
  const goalTagId = String(formData.get("goal_tag_id") ?? "").trim();
  const rawPlacementZone = String(formData.get("placement_zone") ?? "general").trim();
  const drillType = String(formData.get("drill_type") ?? "").trim();
  const duration = Number(String(formData.get("default_duration_minutes") ?? "10"));
  const frequency = String(formData.get("frequency") ?? "none").trim();
  const priorityFlag = formData.get("priority") === "on";
  const notes = String(formData.get("notes") ?? "").trim();
  const additionalTagIds = formData
    .getAll("tag_ids")
    .map((value) => String(value))
    .filter(Boolean);
  const selectedTags = [goalTagId, ...additionalTagIds].filter(Boolean);

  if (!name) {
    return { ok: false, message: "Drill name is required." };
  }

  if (!goalTagId) {
    return { ok: false, message: "Select a practice goal for this drill." };
  }

  const placementZone = isValidPlacementZone(rawPlacementZone) ? rawPlacementZone : "general";

  if (!drillTypes.has(drillType)) {
    return { ok: false, message: "Select a valid drill type." };
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    return { ok: false, message: "Duration must be a positive number." };
  }

  if (!frequencyRules.has(frequency)) {
    return { ok: false, message: "Select a valid frequency rule." };
  }

  let validTagIds = new Set<string>();
  let primaryGoalSlug = "";

  if (selectedTags.length > 0) {
    const { data: validTags, error: tagError } = await supabase
      .from("sport_tags")
      .select("id, category, tag_slug")
      .eq("sport_key", team.sport_key)
      .in("id", selectedTags);

    if (tagError) {
      return { ok: false, message: tagError.message };
    }

    validTagIds = new Set((validTags ?? []).map((tag) => tag.id));

    if (validTagIds.size !== new Set(selectedTags).size) {
      return { ok: false, message: "Selected tags must match your team sport." };
    }

    const selectedGoal = (validTags ?? []).find((tag) => tag.id === goalTagId);

    if (!selectedGoal || selectedGoal.category !== "universal" || !isMainPracticeGoalSlug(selectedGoal.tag_slug ?? "")) {
      return { ok: false, message: "Practice goal must use a valid goal category." };
    }

    primaryGoalSlug = String(selectedGoal.tag_slug).toLowerCase();

    const tagById = new Map((validTags ?? []).map((tag) => [tag.id, tag]));
    for (const tagId of additionalTagIds) {
      const tag = tagById.get(tagId);
      if (!tag) {
        continue;
      }
      if (isMainPracticeGoalSlug(String(tag.tag_slug ?? ""))) {
        return { ok: false, message: "Additional tags cannot use main practice goals." };
      }
    }
    validTagIds.delete(goalTagId);
  }

  return {
    ok: true,
    data: {
      name,
      primaryGoalSlug,
      placementZone,
      drillType,
      duration,
      frequency,
      priorityFlag,
      notes,
      validTagIds,
    },
  };
}

async function requireCurrentTeam() {
  const user = await requireUser();
  const team = await getCurrentTeamForUser(user.id);

  if (!team) {
    redirect("/app");
  }

  return { user, team };
}

export async function copyStarterDrillSetForNewTeam(
  userId: string,
  sportKey: string,
): Promise<{ copiedCount: number }> {
  const supabase = await createClient();
  const targetZones = starterDrillZoneTargets.map((target) => target.zone);

  const { data: sourceDrills, error: sourceError } = await supabase
    .from("drills")
    .select(
      `
        id,
        sport_key,
        primary_goal_slug,
        placement_zone,
        name,
        drill_type,
        default_duration_minutes,
        priority,
        frequency,
        notes,
        player_count,
        equipment,
        setup_instructions,
        how_to_run,
        coaching_points,
        drill_tag_map (
          tag_id
        )
      `,
    )
    .eq("source_type", "system")
    .eq("sport_key", sportKey)
    .eq("is_active", true)
    .in("placement_zone", targetZones)
    .order("priority", { ascending: false })
    .order("name", { ascending: true });

  if (sourceError) {
    throw new Error(sourceError.message);
  }

  const selectedDrills = starterDrillZoneTargets.flatMap((target) =>
    ((sourceDrills ?? []) as StarterDrillSource[])
      .filter((drill) => drill.placement_zone === target.zone)
      .slice(0, target.count),
  );

  if (selectedDrills.length === 0) {
    return { copiedCount: 0 };
  }

  const { data: copiedDrills, error: copiedError } = await supabase
    .from("drills")
    .insert(
      selectedDrills.map((drill) => ({
        owner_user_id: userId,
        sport_key: sportKey,
        source_type: "copied",
        copied_from_drill_id: drill.id,
        name: drill.name,
        primary_goal_slug: resolvePrimaryGoalSlug(drill.primary_goal_slug, drill.drill_type),
        placement_zone: isValidPlacementZone(drill.placement_zone ?? "")
          ? drill.placement_zone
          : derivePlacementZoneFromGoalSlug(resolvePrimaryGoalSlug(drill.primary_goal_slug, drill.drill_type)),
        drill_type: drill.drill_type,
        default_duration_minutes: drill.default_duration_minutes,
        priority: drill.priority,
        frequency: drill.frequency,
        notes: drill.notes || null,
        player_count: drill.player_count || null,
        equipment: drill.equipment || null,
        setup_instructions: drill.setup_instructions || null,
        how_to_run: drill.how_to_run || null,
        coaching_points: drill.coaching_points || null,
        is_active: true,
      })),
    )
    .select("id, copied_from_drill_id");

  if (copiedError) {
    throw new Error(copiedError.message);
  }

  const copiedRows = copiedDrills ?? [];
  const sourceById = new Map(selectedDrills.map((drill) => [drill.id, drill]));
  const tagRows = copiedRows.flatMap((copiedDrill) => {
    const source = sourceById.get(copiedDrill.copied_from_drill_id);
    return (source?.drill_tag_map ?? []).map((mapping) => ({
      drill_id: copiedDrill.id,
      tag_id: mapping.tag_id,
    }));
  });

  if (tagRows.length > 0) {
    const { error: tagCopyError } = await supabase.from("drill_tag_map").insert(tagRows);

    if (tagCopyError) {
      throw new Error(tagCopyError.message);
    }
  }

  return { copiedCount: copiedRows.length };
}

export async function createDrill(formData: FormData) {
  const { user, team } = await requireCurrentTeam();
  const supabase = await createClient();

  const parsed = await parseCoachDrillForm(supabase, team, formData);
  if (!parsed.ok) {
    redirect(`/app/drills?error=${encodeURIComponent(parsed.message)}`);
  }

  const { name, primaryGoalSlug, placementZone, drillType, duration, frequency, priorityFlag, notes, validTagIds } = parsed.data;

  const { data: drill, error: drillError } = await supabase
    .from("drills")
    .insert({
      owner_user_id: user.id,
      sport_key: team.sport_key,
      source_type: "coach",
      name,
      primary_goal_slug: primaryGoalSlug,
      placement_zone: placementZone,
      drill_type: drillType,
      default_duration_minutes: duration,
      priority: priorityFlag ? 5 : 3,
      frequency,
      notes: notes || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (drillError || !drill) {
    redirect(
      `/app/drills?error=${encodeURIComponent(
        drillError?.message ?? "Unable to save drill.",
      )}`,
    );
  }

  if (validTagIds.size > 0) {
    const { error: mapError } = await supabase.from("drill_tag_map").insert(
      Array.from(validTagIds).map((tagId) => ({
        drill_id: drill.id,
        tag_id: tagId,
      })),
    );

    if (mapError) {
      redirect(`/app/drills?error=${encodeURIComponent(mapError.message)}`);
    }
  }

  revalidatePath("/app/drills");
  redirect(
    `/app/drills?success=${encodeURIComponent("Drill saved.")}&created=${encodeURIComponent(String(Date.now()))}`,
  );
}

export async function updateDrill(formData: FormData) {
  const { user, team } = await requireCurrentTeam();
  const supabase = await createClient();
  const drillId = String(formData.get("drill_id") ?? "").trim();

  if (!drillId) {
    redirect("/app/drills?error=Missing%20drill%20id.");
  }

  const parsed = await parseCoachDrillForm(supabase, team, formData);
  if (!parsed.ok) {
    redirect(`/app/drills?error=${encodeURIComponent(parsed.message)}`);
  }

  const { name, primaryGoalSlug, placementZone, drillType, duration, frequency, priorityFlag, notes, validTagIds } = parsed.data;

  const { data: existing, error: existingError } = await supabase
    .from("drills")
    .select("id, source_type, is_active")
    .eq("id", drillId)
    .eq("owner_user_id", user.id)
    .eq("sport_key", team.sport_key)
    .maybeSingle();

  if (existingError) {
    redirect(`/app/drills?error=${encodeURIComponent(existingError.message)}`);
  }

  if (!existing) {
    redirect("/app/drills?error=Drill%20not%20found%20or%20access%20denied.");
  }

  if (existing.source_type === "system") {
    redirect("/app/drills?error=System%20drills%20cannot%20be%20edited%20here.");
  }

  if (!existing.is_active) {
    redirect("/app/drills?error=Archived%20drills%20cannot%20be%20edited.");
  }

  const { data: updated, error: updateError } = await supabase
    .from("drills")
    .update({
      name,
      primary_goal_slug: primaryGoalSlug,
      placement_zone: placementZone,
      drill_type: drillType,
      default_duration_minutes: duration,
      frequency,
      priority: priorityFlag ? 5 : 3,
      notes: notes || null,
    })
    .eq("id", drillId)
    .eq("owner_user_id", user.id)
    .eq("sport_key", team.sport_key)
    .in("source_type", ["coach", "copied"])
    .eq("is_active", true)
    .select("id")
    .maybeSingle();

  if (updateError) {
    redirect(`/app/drills?error=${encodeURIComponent(updateError.message)}`);
  }

  if (!updated) {
    redirect("/app/drills?error=Unable%20to%20update%20drill.");
  }

  const { error: deleteMapError } = await supabase
    .from("drill_tag_map")
    .delete()
    .eq("drill_id", drillId);

  if (deleteMapError) {
    redirect(`/app/drills?error=${encodeURIComponent(deleteMapError.message)}`);
  }

  if (validTagIds.size > 0) {
    const { error: mapError } = await supabase.from("drill_tag_map").insert(
      Array.from(validTagIds).map((tagId) => ({
        drill_id: drillId,
        tag_id: tagId,
      })),
    );

    if (mapError) {
      redirect(`/app/drills?error=${encodeURIComponent(mapError.message)}`);
    }
  }

  revalidatePath("/app/drills");
  revalidatePath("/app/practices");
  redirect(`/app/drills?success=${encodeURIComponent("Drill updated.")}&openDrill=${encodeURIComponent(drillId)}`);
}

export async function archiveDrill(formData: FormData) {
  const { user, team } = await requireCurrentTeam();
  const supabase = await createClient();
  const drillId = String(formData.get("drill_id") ?? "");

  if (!drillId) {
    redirect("/app/drills?error=Missing%20drill%20id.");
  }

  const { error } = await supabase
    .from("drills")
    .update({ is_active: false })
    .eq("id", drillId)
    .eq("owner_user_id", user.id)
    .eq("sport_key", team.sport_key)
    .in("source_type", ["coach", "copied"]);

  if (error) {
    redirect(`/app/drills?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/drills");
  redirect("/app/drills?success=Drill%20archived.");
}

export async function deleteDrill(formData: FormData) {
  const { user, team } = await requireCurrentTeam();
  const supabase = await createClient();
  const drillId = String(formData.get("drill_id") ?? "").trim();

  if (!drillId) {
    redirect("/app/drills?error=Missing%20drill%20id.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("drills")
    .select("id")
    .eq("id", drillId)
    .eq("owner_user_id", user.id)
    .eq("sport_key", team.sport_key)
    .eq("is_active", true)
    .in("source_type", ["coach", "copied"])
    .maybeSingle();

  if (existingError) {
    redirect(`/app/drills?error=${encodeURIComponent(existingError.message)}`);
  }

  if (!existing) {
    redirect("/app/drills?error=Drill%20not%20found%20or%20cannot%20be%20deleted.");
  }

  const { data: usageRows, error: usageError } = await supabase
    .from("practice_block_drills")
    .select("id")
    .eq("drill_id", drillId)
    .limit(1);

  if (usageError) {
    redirect(`/app/drills?error=${encodeURIComponent(usageError.message)}`);
  }

  if ((usageRows ?? []).length > 0) {
    redirect("/app/drills?error=This%20drill%20is%20used%20in%20saved%20practices.%20Archive%20it%20instead.");
  }

  const { error: mapDeleteError } = await supabase
    .from("drill_tag_map")
    .delete()
    .eq("drill_id", drillId);

  if (mapDeleteError) {
    redirect(`/app/drills?error=${encodeURIComponent(mapDeleteError.message)}`);
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("drills")
    .delete()
    .eq("id", drillId)
    .eq("owner_user_id", user.id)
    .eq("sport_key", team.sport_key)
    .eq("is_active", true)
    .in("source_type", ["coach", "copied"])
    .select("id")
    .maybeSingle();

  if (deleteError) {
    redirect(`/app/drills?error=${encodeURIComponent(deleteError.message)}`);
  }

  if (!deleted) {
    redirect("/app/drills?error=Drill%20not%20found%20or%20cannot%20be%20deleted.");
  }

  revalidatePath("/app/drills");
  redirect("/app/drills?success=Drill%20deleted.");
}

export async function restoreDrill(formData: FormData) {
  const { user, team } = await requireCurrentTeam();
  const supabase = await createClient();
  const drillId = String(formData.get("drill_id") ?? "");

  if (!drillId) {
    redirect("/app/drills?error=Missing%20drill%20id.");
  }

  const { error } = await supabase
    .from("drills")
    .update({ is_active: true })
    .eq("id", drillId)
    .eq("owner_user_id", user.id)
    .eq("sport_key", team.sport_key)
    .in("source_type", ["coach", "copied"]);

  if (error) {
    redirect(`/app/drills?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/drills");
  redirect("/app/drills?success=Drill%20restored.");
}

export async function copySystemDrillToMyDrills(formData: FormData) {
  const { user, team } = await requireCurrentTeam();
  const supabase = await createClient();
  const sourceDrillId = String(formData.get("source_drill_id") ?? "").trim();

  if (!sourceDrillId) {
    redirect("/app/library?error=Missing%20starter%20drill%20id.");
  }

  const subscription = await getUserSubscriptionPlan(user.id);

  if (!["trial", "paid"].includes(subscription.plan_type)) {
    redirect("/app/library?error=Starter%20library%20requires%20a%20trial%20or%20paid%20plan.");
  }

  const { data: sourceDrill, error: sourceDrillError } = await supabase
    .from("drills")
    .select(
      `
        id,
        sport_key,
        source_type,
        primary_goal_slug,
        placement_zone,
        name,
        drill_type,
        default_duration_minutes,
        notes,
        drill_tag_map (
          tag_id
        )
      `,
    )
    .eq("id", sourceDrillId)
    .eq("source_type", "system")
    .eq("is_active", true)
    .maybeSingle();

  if (sourceDrillError) {
    redirect(`/app/library?error=${encodeURIComponent(sourceDrillError.message)}`);
  }

  if (!sourceDrill) {
    redirect("/app/library?error=Starter%20drill%20not%20found.");
  }

  if (sourceDrill.sport_key !== team.sport_key) {
    redirect("/app/library?error=Starter%20drill%20must%20match%20your%20team%20sport.");
  }

  const { data: copiedDrill, error: copiedDrillError } = await supabase
    .from("drills")
    .insert({
      owner_user_id: user.id,
      sport_key: team.sport_key,
      source_type: "copied",
      copied_from_drill_id: sourceDrill.id,
      name: sourceDrill.name,
      primary_goal_slug: resolvePrimaryGoalSlug(sourceDrill.primary_goal_slug, sourceDrill.drill_type),
      placement_zone: isValidPlacementZone(sourceDrill.placement_zone ?? "")
        ? sourceDrill.placement_zone
        : derivePlacementZoneFromGoalSlug(resolvePrimaryGoalSlug(sourceDrill.primary_goal_slug, sourceDrill.drill_type)),
      drill_type: sourceDrill.drill_type,
      default_duration_minutes: sourceDrill.default_duration_minutes,
      priority: 3,
      frequency: "none",
      notes: sourceDrill.notes || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (copiedDrillError || !copiedDrill) {
    redirect(
      `/app/library?error=${encodeURIComponent(
        copiedDrillError?.message ?? "Unable to copy starter drill.",
      )}`,
    );
  }

  const tagIds = (sourceDrill.drill_tag_map ?? []).map((mapping) => mapping.tag_id);

  if (tagIds.length > 0) {
    const { error: tagCopyError } = await supabase.from("drill_tag_map").insert(
      tagIds.map((tagId) => ({
        drill_id: copiedDrill.id,
        tag_id: tagId,
      })),
    );

    if (tagCopyError) {
      redirect(`/app/library?error=${encodeURIComponent(tagCopyError.message)}`);
    }
  }

  revalidatePath("/app/library");
  revalidatePath("/app/drills");
  redirect("/app/drills?success=Starter%20drill%20copied%20to%20My%20Drills.");
}
