import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { copyStarterDrillSetForNewTeam } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getCurrentTeamForUser: vi.fn(),
  getUserSubscriptionPlan: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

type SourceDrill = {
  id: string;
  sport_key: string;
  source_type: "system" | "coach" | "copied";
  primary_goal_slug: string | null;
  placement_zone: string;
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
  is_active: boolean;
  drill_tag_map: Array<{ tag_id: string }>;
};

type StarterCopyClientState = {
  insertedDrills: Array<Record<string, unknown>>;
  insertedTagRows: Array<{ drill_id: string; tag_id: string }>;
};

const zones = [
  "warmup",
  "offense",
  "defense",
  "situational",
  "end_practice",
  "general",
] as const;

function sourceDrill(
  id: string,
  placementZone: (typeof zones)[number],
  overrides: Partial<SourceDrill> = {},
): SourceDrill {
  return {
    id,
    sport_key: "basketball",
    source_type: "system",
    primary_goal_slug: placementZone === "end_practice" ? "competitive" : placementZone,
    placement_zone: placementZone,
    name: `${placementZone} ${id}`,
    drill_type: placementZone === "warmup" ? "warmup" : "team",
    default_duration_minutes: 10,
    priority: 3,
    frequency: "none",
    notes: `${id} notes`,
    player_count: `${id} players`,
    equipment: `${id} equipment`,
    setup_instructions: `${id} setup`,
    how_to_run: `${id} run`,
    coaching_points: `${id} points`,
    is_active: true,
    drill_tag_map: [],
    ...overrides,
  };
}

function fullStarterSourceRows() {
  return [
    sourceDrill("warm-1", "warmup", { priority: 5, name: "A Warmup", drill_tag_map: [{ tag_id: "tag-warm" }] }),
    sourceDrill("warm-2", "warmup", { priority: 4, name: "B Warmup" }),
    sourceDrill("warm-3", "warmup", { priority: 1, name: "C Warmup" }),
    sourceDrill("off-1", "offense", { priority: 5, name: "A Offense", drill_tag_map: [{ tag_id: "tag-off-1" }] }),
    sourceDrill("off-2", "offense", { priority: 4, name: "B Offense", drill_tag_map: [{ tag_id: "tag-off-2" }] }),
    sourceDrill("off-3", "offense", { priority: 1, name: "C Offense" }),
    sourceDrill("def-1", "defense", { priority: 5, name: "A Defense" }),
    sourceDrill("def-2", "defense", { priority: 4, name: "B Defense" }),
    sourceDrill("def-3", "defense", { priority: 1, name: "C Defense" }),
    sourceDrill("sit-1", "situational", { priority: 5, name: "A Situational" }),
    sourceDrill("sit-2", "situational", { priority: 4, name: "B Situational" }),
    sourceDrill("sit-3", "situational", { priority: 1, name: "C Situational" }),
    sourceDrill("end-1", "end_practice", { priority: 5, name: "A End" }),
    sourceDrill("end-2", "end_practice", { priority: 1, name: "B End" }),
    sourceDrill("gen-1", "general", { priority: 5, name: "A General" }),
    sourceDrill("gen-2", "general", { priority: 1, name: "B General" }),
  ];
}

function buildStarterCopyClient(sourceRows: SourceDrill[]): StarterCopyClientState & { client: unknown } {
  const state: StarterCopyClientState & { client?: unknown } = {
    insertedDrills: [],
    insertedTagRows: [],
  };

  const client = {
    from(table: string) {
      if (table === "drills") {
        let selecting = false;

        return {
          select() {
            selecting = true;
            const filters: Array<[string, unknown]> = [];
            const inFilters: Array<[string, unknown[]]> = [];
            let orderCount = 0;

            const selectChain = {
              eq(field: string, value: unknown) {
                filters.push([field, value]);
                return selectChain;
              },
              in(field: string, values: unknown[]) {
                inFilters.push([field, values]);
                return selectChain;
              },
              order(field: string, options: { ascending: boolean }) {
                orderCount += 1;

                if (orderCount < 2) {
                  return selectChain;
                }

                const rows = sourceRows
                  .filter((row) => filters.every(([key, value]) => row[key as keyof SourceDrill] === value))
                  .filter((row) => inFilters.every(([key, values]) => values.includes(row[key as keyof SourceDrill])))
                  .sort((first, second) => {
                    if (field === "name" && options.ascending) {
                      return first.name.localeCompare(second.name);
                    }
                    return 0;
                  })
                  .sort((first, second) => second.priority - first.priority || first.name.localeCompare(second.name));

                return Promise.resolve({ data: rows, error: null });
              },
            };

            return selectChain;
          },
          insert(values: Array<Record<string, unknown>>) {
            if (selecting) {
              throw new Error("unexpected insert after select");
            }

            state.insertedDrills = values;
            return {
              select: () =>
                Promise.resolve({
                  data: values.map((value, index) => ({
                    id: `copy-${index + 1}`,
                    copied_from_drill_id: value.copied_from_drill_id,
                  })),
                  error: null,
                }),
            };
          },
        };
      }

      if (table === "drill_tag_map") {
        return {
          insert(rows: Array<{ drill_id: string; tag_id: string }>) {
            state.insertedTagRows = rows;
            return Promise.resolve({ error: null });
          },
        };
      }

      throw new Error(`unexpected table ${table}`);
    },
  };

  state.client = client;
  return state as StarterCopyClientState & { client: unknown };
}

describe("copyStarterDrillSetForNewTeam", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("copies 10 drills when system drills are available in all zones", async () => {
    const built = buildStarterCopyClient(fullStarterSourceRows());
    vi.mocked(createClient).mockResolvedValue(built.client as never);

    const result = await copyStarterDrillSetForNewTeam("coach-1", "basketball");

    expect(result).toEqual({ copiedCount: 10 });
    expect(built.insertedDrills).toHaveLength(10);
    expect(built.insertedDrills.map((row) => row.copied_from_drill_id)).toEqual([
      "warm-1",
      "warm-2",
      "off-1",
      "off-2",
      "def-1",
      "def-2",
      "sit-1",
      "sit-2",
      "end-1",
      "gen-1",
    ]);
  });

  it("copies fewer than 10 when zones are missing system drills and returns the actual count", async () => {
    const rows = [
      sourceDrill("warm-1", "warmup"),
      sourceDrill("off-1", "offense"),
      sourceDrill("off-2", "offense"),
      sourceDrill("gen-1", "general"),
    ];
    const built = buildStarterCopyClient(rows);
    vi.mocked(createClient).mockResolvedValue(built.client as never);

    const result = await copyStarterDrillSetForNewTeam("coach-1", "basketball");

    expect(result).toEqual({ copiedCount: 4 });
    expect(built.insertedDrills.map((row) => row.copied_from_drill_id)).toEqual([
      "warm-1",
      "off-1",
      "off-2",
      "gen-1",
    ]);
  });

  it("marks each copied row as copied for the requested owner and source drill", async () => {
    const built = buildStarterCopyClient(fullStarterSourceRows());
    vi.mocked(createClient).mockResolvedValue(built.client as never);

    await copyStarterDrillSetForNewTeam("coach-42", "basketball");

    const sourceIds = new Set(fullStarterSourceRows().map((row) => row.id));
    expect(built.insertedDrills).toHaveLength(10);
    expect(
      built.insertedDrills.every(
        (row) =>
          row.source_type === "copied" &&
          row.owner_user_id === "coach-42" &&
          sourceIds.has(String(row.copied_from_drill_id)),
      ),
    ).toBe(true);
  });

  it("copies tag mappings for every selected drill that had tags", async () => {
    const built = buildStarterCopyClient(fullStarterSourceRows());
    vi.mocked(createClient).mockResolvedValue(built.client as never);

    await copyStarterDrillSetForNewTeam("coach-1", "basketball");

    expect(built.insertedTagRows).toEqual([
      { drill_id: "copy-1", tag_id: "tag-warm" },
      { drill_id: "copy-3", tag_id: "tag-off-1" },
      { drill_id: "copy-4", tag_id: "tag-off-2" },
    ]);
  });

  it("does not copy across sport boundaries", async () => {
    const rows = [
      ...fullStarterSourceRows(),
      sourceDrill("soc-warm-1", "warmup", { sport_key: "soccer", priority: 99, name: "AAA Soccer Warmup" }),
      sourceDrill("soc-off-1", "offense", { sport_key: "soccer", priority: 99, name: "AAA Soccer Offense" }),
    ];
    const built = buildStarterCopyClient(rows);
    vi.mocked(createClient).mockResolvedValue(built.client as never);

    await copyStarterDrillSetForNewTeam("coach-1", "basketball");

    expect(built.insertedDrills.map((row) => row.copied_from_drill_id)).not.toContain("soc-warm-1");
    expect(built.insertedDrills.map((row) => row.copied_from_drill_id)).not.toContain("soc-off-1");
    expect(new Set(built.insertedDrills.map((row) => row.sport_key))).toEqual(new Set(["basketball"]));
  });
});
