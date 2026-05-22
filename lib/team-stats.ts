import type { SupabaseClient } from "@supabase/supabase-js";

export type TeamStatSignal = {
  slug: string;
  label: string;
  strength: number;
  sourceStatKeys: string[];
  notes?: string | null;
};

export type ParsedTeamStatValue = {
  statKey: string;
  statLabel: string;
  statValue: number | null;
  statUnit: string | null;
  subjectType: "team" | "opponent" | "player" | "lineup" | "unit";
  subjectName: string | null;
  periodLabel: string | null;
  rawValue: string;
};

export type ParsedTeamStats = {
  rawText: string;
  values: ParsedTeamStatValue[];
  signals: TeamStatSignal[];
};

export type TeamStatsContext = {
  user: { id: string };
  team: { id: string; sport_key: string };
  activeSeason?: { id: string } | null;
};

function statKeyFromLabel(label: string) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function canonicalStatKey(sportKey: string, label: string) {
  const key = statKeyFromLabel(label);

  const universalAliases: Record<string, string> = {
    opponent: "opponent",
    opp: "opponent",
    date: "date",
    game_date: "date",
    player: "player",
    athlete: "player",
    name: "player",
    team: "team",
  };

  const sportAliases: Record<string, Record<string, string>> = {
    basketball: {
      to: "turnovers",
      tov: "turnovers",
      turnover: "turnovers",
      turnovers: "turnovers",
      oreb_allowed: "offensive_rebounds_allowed",
      orb_allowed: "offensive_rebounds_allowed",
      opp_oreb: "offensive_rebounds_allowed",
      opp_orb: "offensive_rebounds_allowed",
      opponent_oreb: "offensive_rebounds_allowed",
      opponent_orb: "offensive_rebounds_allowed",
      opponent_offensive_rebounds: "offensive_rebounds_allowed",
      offensive_rebounds_allowed: "offensive_rebounds_allowed",
      second_chance_points: "offensive_rebounds_allowed",
      ft: "free_throws",
      fta: "free_throws",
      ftm: "free_throws",
      ft_percent: "free_throws",
      free_throw: "free_throws",
      free_throws: "free_throws",
      free_throw_percentage: "free_throws",
    },
    soccer: {
      shots_conceded: "shots_conceded",
      shots_allowed: "shots_conceded",
      shots_against: "shots_conceded",
      opp_shots: "shots_conceded",
      opponent_shots: "shots_conceded",
      corners_conceded: "corners_conceded",
      corners_allowed: "corners_conceded",
      opp_corners: "corners_conceded",
      opponent_corners: "corners_conceded",
      set_pieces_allowed: "corners_conceded",
      set_pieces: "corners_conceded",
    },
    volleyball: {
      aces_allowed: "aces_allowed",
      ace_allowed: "aces_allowed",
      opp_aces: "aces_allowed",
      opponent_aces: "aces_allowed",
      reception_errors: "aces_allowed",
      receive_errors: "aces_allowed",
      serve_receive_errors: "aces_allowed",
      serve_receive: "serve_receive",
      out_of_system: "out_of_system",
      oos: "out_of_system",
      free_ball: "free_ball",
      free_balls: "free_ball",
    },
    baseball: {
      e: "errors",
      err: "errors",
      error: "errors",
      errors: "errors",
      sb: "stolen_bases",
      stolen_base: "stolen_bases",
      stolen_bases: "stolen_bases",
      steals_allowed: "stolen_bases",
      bunt: "bunt",
      bunts: "bunt",
      bunt_defense: "bunt",
    },
    softball: {
      e: "errors",
      err: "errors",
      error: "errors",
      errors: "errors",
      sb: "stolen_bases",
      stolen_base: "stolen_bases",
      stolen_bases: "stolen_bases",
      steals_allowed: "stolen_bases",
      bunt: "bunt",
      bunts: "bunt",
      bunt_defense: "bunt",
    },
  };

  return sportAliases[sportKey]?.[key] ?? universalAliases[key] ?? key;
}

function addSignal(
  signals: Map<string, TeamStatSignal>,
  slug: string,
  label: string,
  sourceStatKeys: string[],
  strength = 1,
  notes?: string,
) {
  const current = signals.get(slug);
  if (current) {
    current.strength += strength;
    sourceStatKeys.forEach((key) => {
      if (!current.sourceStatKeys.includes(key)) current.sourceStatKeys.push(key);
    });
    return;
  }

  signals.set(slug, {
    slug,
    label,
    strength,
    sourceStatKeys,
    notes: notes ?? null,
  });
}

function parseNumber(value: string) {
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  if (!/[0-9]/.test(cleaned)) {
    return null;
  }

  const statValue = Number(cleaned);
  return Number.isFinite(statValue) ? statValue : null;
}

function parseCsvRows(rawText: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < rawText.length; index += 1) {
    const char = rawText[index];
    const next = rawText[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function parseCsvTableStats(sportKey: string, rawText: string): ParsedTeamStatValue[] {
  const rows = parseCsvRows(rawText);
  if (rows.length < 2 || rows[0].length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  const likelyHeaderCount = headers.filter((header) => header && parseNumber(header) === null).length;
  if (likelyHeaderCount < 2) {
    return [];
  }

  const values: ParsedTeamStatValue[] = [];

  rows.slice(1).forEach((row) => {
    const subjectHeaderIndex = headers.findIndex((header) =>
      ["player", "athlete", "name", "team"].includes(canonicalStatKey(sportKey, header)),
    );
    const subjectName = subjectHeaderIndex >= 0 ? row[subjectHeaderIndex]?.trim() || null : null;

    headers.forEach((header, index) => {
      const rawValue = row[index]?.trim() ?? "";
      const statKey = canonicalStatKey(sportKey, header);

      if (!header || !rawValue || ["date", "opponent", "player", "team"].includes(statKey)) {
        return;
      }

      values.push({
        statKey,
        statLabel: header,
        statValue: parseNumber(rawValue),
        statUnit: rawValue.includes("%") ? "percent" : null,
        subjectType: subjectName ? "player" : "team",
        subjectName,
        periodLabel: null,
        rawValue,
      });
    });
  });

  return values;
}

function parseDelimitedStats(sportKey: string, rawText: string): ParsedTeamStatValue[] {
  const tableValues = rawText.includes(",") ? parseCsvTableStats(sportKey, rawText) : [];
  const rows = rawText
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  const values: ParsedTeamStatValue[] = [...tableValues];

  for (const row of rows) {
    const parts = row.includes(":") || row.includes("=")
      ? row.split(/[:=]/).map((part) => part.trim())
      : row.split(",").map((part) => part.trim());

    if (parts.length !== 2) {
      continue;
    }

    const [label, rawValue] = parts;
    const statKey = canonicalStatKey(sportKey, label);

    if (!statKey || ["date", "opponent", "player", "team"].includes(statKey)) {
      continue;
    }

    values.push({
      statKey,
      statLabel: label,
      statValue: parseNumber(rawValue),
      statUnit: String(rawValue).includes("%") ? "percent" : null,
      subjectType: "team",
      subjectName: null,
      periodLabel: null,
      rawValue,
    });
  }

  return values;
}

export function parseTeamStatsForSignals(sportKey: string, rawText: string): ParsedTeamStats | null {
  const cleaned = rawText.trim();
  if (!cleaned) {
    return null;
  }

  const values = parseDelimitedStats(sportKey, cleaned);
  const signals = new Map<string, TeamStatSignal>();
  const lower = cleaned.toLowerCase();
  const valueByKey = new Map(values.map((value) => [value.statKey, value]));

  function hasMetric(...needles: string[]) {
    return needles.some((needle) => lower.includes(needle) || valueByKey.has(canonicalStatKey(sportKey, needle)));
  }

  if (sportKey === "basketball") {
    if (hasMetric("turnovers", "turnover", "to")) {
      addSignal(signals, "ball_handling", "Ball handling", ["turnovers"], 1.5, "Turnovers mentioned in team stats.");
      addSignal(signals, "decision_making", "Decision-making", ["turnovers"], 1.2);
      addSignal(signals, "press_break", "Press break", ["turnovers"], 1.2);
    }
    if (hasMetric("offensive rebounds allowed", "oreb allowed", "second chance")) {
      addSignal(signals, "boxing_out", "Boxing out", ["offensive_rebounds_allowed"], 1.3);
      addSignal(signals, "rebounding", "Rebounding", ["offensive_rebounds_allowed"], 1.3);
    }
    if (hasMetric("free throws", "ft", "free throw")) {
      addSignal(signals, "free_throw_pressure", "Free throw pressure", ["free_throws"], 1);
    }
  } else if (sportKey === "soccer") {
    if (hasMetric("shots conceded", "shots allowed")) {
      addSignal(signals, "defending", "Defending", ["shots_conceded"], 1.4);
      addSignal(signals, "transition_defense", "Transition defense", ["shots_conceded"], 1.1);
    }
    if (hasMetric("corners conceded", "set pieces")) {
      addSignal(signals, "defending_set_pieces", "Defending set pieces", ["corners_conceded"], 1.2);
    }
  } else if (sportKey === "volleyball") {
    if (hasMetric("aces allowed", "ace allowed", "aces", "serve receive")) {
      addSignal(signals, "serve_receive", "Serve receive", ["aces_allowed"], 1.6);
    }
    if (hasMetric("out of system", "free ball")) {
      addSignal(signals, "out_of_system", "Out-of-system", ["out_of_system"], 1.2);
      addSignal(signals, "free_ball_transition", "Free ball transition", ["free_ball"], 1);
    }
  } else if (sportKey === "baseball" || sportKey === "softball") {
    if (hasMetric("errors", "error")) {
      addSignal(signals, "fielding", "Fielding", ["errors"], 1.4);
      addSignal(signals, "throwing", "Throwing", ["errors"], 1.1);
      addSignal(signals, "communication", "Communication", ["errors"], 1);
    }
    if (hasMetric("stolen bases", "steal")) {
      addSignal(signals, "steal_defense", "Steal defense", ["stolen_bases"], 1.2);
    }
    if (hasMetric("bunt")) {
      addSignal(signals, "bunt_defense", "Bunt defense", ["bunt"], 1);
    }
  }

  return {
    rawText: cleaned,
    values,
    signals: Array.from(signals.values()),
  };
}

export async function createTeamStatReport(
  supabase: SupabaseClient,
  context: TeamStatsContext,
  input: {
    parsed: ParsedTeamStats;
    eventDate?: string | null;
    opponentName?: string | null;
    title?: string | null;
    sourceType: "manual" | "csv_upload" | "api_import" | "system_import";
    sourceApp?: string;
  },
) {
  const { data: report, error: reportError } = await supabase
    .from("team_stat_reports")
    .insert({
      team_id: context.team.id,
      season_id: context.activeSeason?.id ?? null,
      created_by: context.user.id,
      sport_key: context.team.sport_key,
      event_date: input.eventDate || null,
      opponent_name: input.opponentName || null,
      title: input.title || "Team stats",
      source_type: input.sourceType,
      source_app: input.sourceApp ?? "practice_planner",
      raw_text: input.parsed.rawText,
      raw_payload: { values: input.parsed.values },
      computed_summary: {
        signals: input.parsed.signals,
      },
    })
    .select("id")
    .single();

  if (reportError || !report) {
    throw new Error(reportError?.message ?? "Unable to save team stats.");
  }

  if (input.parsed.values.length > 0) {
    const { error: valueError } = await supabase.from("team_stat_values").insert(
      input.parsed.values.map((value) => ({
        stat_report_id: report.id,
        team_id: context.team.id,
        sport_key: context.team.sport_key,
        stat_key: value.statKey,
        stat_label: value.statLabel,
        stat_value: value.statValue,
        stat_unit: value.statUnit,
        subject_type: value.subjectType,
        subject_name: value.subjectName,
        period_label: value.periodLabel,
        raw_value: value.rawValue,
      })),
    );

    if (valueError) {
      throw new Error(valueError.message);
    }
  }

  if (input.parsed.signals.length > 0) {
    const { error: signalError } = await supabase.from("team_stat_signals").insert(
      input.parsed.signals.map((signal) => ({
        stat_report_id: report.id,
        team_id: context.team.id,
        sport_key: context.team.sport_key,
        signal_slug: signal.slug,
        signal_label: signal.label,
        strength: signal.strength,
        source_stat_keys: signal.sourceStatKeys,
        notes: signal.notes ?? null,
      })),
    );

    if (signalError) {
      throw new Error(signalError.message);
    }
  }

  return report.id as string;
}

export async function loadRecentTeamStatSignals(
  supabase: SupabaseClient,
  context: TeamStatsContext,
  limit = 30,
): Promise<TeamStatSignal[]> {
  const { data, error } = await supabase
    .from("team_stat_signals")
    .select("signal_slug, signal_label, strength, source_stat_keys, notes")
    .eq("team_id", context.team.id)
    .eq("sport_key", context.team.sport_key)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const merged = new Map<string, TeamStatSignal>();
  (data ?? []).forEach((row) => {
    addSignal(
      merged,
      row.signal_slug,
      row.signal_label,
      Array.isArray(row.source_stat_keys) ? row.source_stat_keys : [],
      Number(row.strength ?? 1),
      row.notes ?? undefined,
    );
  });

  return Array.from(merged.values()).sort((left, right) => right.strength - left.strength);
}
