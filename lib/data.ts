import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getSportConfigs = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sport_configs")
    .select("sport_key, display_name")
    .eq("is_active", true)
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getUserTeams = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, sport_key")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getCurrentTeamForUser = cache(async (userId: string) => {
  const teams = await getUserTeams(userId);
  return teams[0] ?? null;
});

export const getActiveSeasonForTeam = cache(async (teamId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("id, name, is_active")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getSportTagsForSport = cache(async (sportKey: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sport_tags")
    .select("id, sport_key, tag_name, tag_slug, category")
    .eq("sport_key", sportKey)
    .order("category", { ascending: true })
    .order("tag_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getCoachDrills = cache(async (userId: string, isActive: boolean, sportKey: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drills")
    .select(
      `
        id,
        name,
        source_type,
        copied_from_drill_id,
        primary_goal_slug,
        placement_zone,
        drill_type,
        default_duration_minutes,
        priority,
        frequency,
        notes,
        is_active,
        updated_at,
        drill_tag_map (
          tag_id,
          sport_tags (
            id,
            tag_name,
            tag_slug,
            category
          )
        )
      `,
    )
    .eq("owner_user_id", userId)
    .eq("sport_key", sportKey)
    .in("source_type", ["coach", "copied"])
    .eq("is_active", isActive)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getUserSubscriptionPlan = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_type, status, current_period_end, trial_ends_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (
    data ?? {
      plan_type: "free",
      status: null,
      current_period_end: null,
      trial_ends_at: null,
    }
  );
});

export const getSystemDrillsForSport = cache(async (sportKey: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drills")
    .select(
      `
        id,
        name,
        source_type,
        drill_type,
        default_duration_minutes,
        priority,
        frequency,
        notes,
        is_active,
        updated_at,
        drill_tag_map (
          tag_id,
          sport_tags (
            id,
            tag_name,
            tag_slug,
            category
          )
        )
      `,
    )
    .eq("source_type", "system")
    .eq("is_active", true)
    .eq("sport_key", sportKey)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getPracticesForTeam = cache(async (teamId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("practices")
    .select(
      `
        id,
        title,
        practice_date,
        practice_type,
        total_planned_minutes,
        custom_focus,
        notes,
        season_id,
        created_at,
        practice_blocks (
          id,
          block_name,
          start_minute,
          item_type,
          block_order,
          planned_duration_minutes,
          practice_block_drills (
            id
          )
        )
      `,
    )
    .eq("team_id", teamId)
    .order("practice_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getPracticeForTeam = cache(async (practiceId: string, teamId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("practices")
    .select(
      `
        id,
        title,
        practice_date,
        practice_type,
        total_planned_minutes,
        custom_focus,
        notes,
        season_id,
        created_at,
        practice_blocks (
          id,
          template_id,
          block_name,
          start_minute,
          item_type,
          block_order,
          planned_duration_minutes,
          notes,
          practice_block_drills (
            id,
            drill_id,
            segment_order,
            segment_name,
            duration_minutes,
            notes,
            drills (
              id,
              name,
              drill_type,
              frequency,
              priority
            )
          )
        )
      `,
    )
    .eq("id", practiceId)
    .eq("team_id", teamId)
    .order("block_order", { referencedTable: "practice_blocks", ascending: true })
    .order("segment_order", {
      referencedTable: "practice_blocks.practice_block_drills",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getPracticeTemplatesForSport = cache(async (sportKey: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("practice_templates")
    .select(
      `
        id,
        sport_key,
        template_key,
        display_name,
        description,
        sort_order,
        is_active,
        practice_template_blocks (
          id,
          block_key,
          block_name,
          block_order,
          default_duration_minutes,
          item_type,
          placement_zone,
          allows_subcategory_focus,
          is_optional,
          notes
        )
      `,
    )
    .eq("sport_key", sportKey)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("block_order", { referencedTable: "practice_template_blocks", ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});
