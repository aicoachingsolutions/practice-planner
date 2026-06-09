import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { archiveDrill, copySystemDrillToMyDrills, createDrill, deleteDrill, restoreDrill, updateDrill } from "./actions";
import { getUserSubscriptionPlan } from "@/lib/data";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockUser = { id: "coach-user-1" };

const mockTeamState: { team: { id: string; name: string; sport_key: string } } = {
  team: { id: "team-1", name: "Varsity", sport_key: "basketball" },
};

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn(async () => mockUser),
}));

vi.mock("@/lib/data", () => ({
  getCurrentTeamForUser: vi.fn(async () => mockTeamState.team),
  getUserSubscriptionPlan: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const sportTagRows = [
  { id: "tag-goal-1", category: "universal", tag_slug: "offense" },
  { id: "tag-detail-1", category: "sport_specific", tag_slug: "passing" },
];

function sportTagsChain() {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.in = () => Promise.resolve({ data: sportTagRows, error: null });
  return chain;
}

function drillsSelectChain(existing: { data: unknown; error: unknown | null }) {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.maybeSingle = () => Promise.resolve(existing);
  return chain;
}

function drillsUpdateChain(
  result: { data: unknown; error: unknown | null },
  onEq?: (field: string, value: unknown) => void,
  onUpdate?: (values: Record<string, unknown>) => void,
) {
  const chain: Record<string, unknown> = {};
  chain.update = (values: Record<string, unknown>) => {
    onUpdate?.(values);
    return chain;
  };
  chain.eq = (field: string, value: unknown) => {
    onEq?.(field, value);
    return chain;
  };
  chain.in = () => chain;
  chain.select = () => chain;
  chain.maybeSingle = () => Promise.resolve(result);
  return chain;
}

function drillsArchiveRestoreChain(onEq?: (field: string, value: unknown) => void) {
  const chain: Record<string, unknown> = {};
  chain.update = () => chain;
  chain.eq = (field: string, value: unknown) => {
    onEq?.(field, value);
    return chain;
  };
  chain.in = () => Promise.resolve({ error: null });
  return chain;
}

function drillsDeleteSelectChain(result: { data: unknown; error: unknown | null }) {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.in = () => chain;
  chain.maybeSingle = () => Promise.resolve(result);
  return chain;
}

function drillsDeleteChain(
  result: { data: unknown; error: unknown | null },
  onEq?: (field: string, value: unknown) => void,
) {
  const chain: Record<string, unknown> = {};
  chain.delete = () => chain;
  chain.eq = (field: string, value: unknown) => {
    onEq?.(field, value);
    return chain;
  };
  chain.in = () => chain;
  chain.select = () => chain;
  chain.maybeSingle = () => Promise.resolve(result);
  return chain;
}

function practiceBlockDrillsUsageChain(rows: unknown[]) {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.limit = () => Promise.resolve({ data: rows, error: null });
  return chain;
}

function drillTagMapDeleteChain() {
  return {
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  };
}

function drillTagMapInsertChain() {
  return {
    insert: () => Promise.resolve({ error: null }),
  };
}

function buildUpdateDrillClient(options: {
  existing: { data: unknown; error: unknown | null };
  updated?: { data: unknown; error: unknown | null };
  onUpdateEq?: (field: string, value: unknown) => void;
  onUpdateValues?: (values: Record<string, unknown>) => void;
}) {
  let drillsFromCount = 0;
  let mapDeleteDone = false;

  return {
    from(table: string) {
      if (table === "sport_tags") {
        return sportTagsChain();
      }
      if (table === "drills") {
        drillsFromCount += 1;
        if (drillsFromCount === 1) {
          return drillsSelectChain(options.existing);
        }
        return drillsUpdateChain(
          options.updated ?? { data: { id: "d1" }, error: null },
          options.onUpdateEq,
          options.onUpdateValues,
        );
      }
      if (table === "drill_tag_map") {
        if (!mapDeleteDone) {
          mapDeleteDone = true;
          return drillTagMapDeleteChain();
        }
        return drillTagMapInsertChain();
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

function buildDrillsArchiveRestoreClient(onEq?: (field: string, value: unknown) => void) {
  return {
    from(table: string) {
      if (table !== "drills") {
        throw new Error(`unexpected table ${table}`);
      }
      return drillsArchiveRestoreChain(onEq);
    },
  };
}

function buildDeleteDrillClient(options: {
  existing: { data: unknown; error: unknown | null };
  usageRows: unknown[];
  deleted?: { data: unknown; error: unknown | null };
  onDeleteEq?: (field: string, value: unknown) => void;
}) {
  let drillsFromCount = 0;
  let mapDeleteDone = false;

  return {
    from(table: string) {
      if (table === "drills") {
        drillsFromCount += 1;
        if (drillsFromCount === 1) {
          return drillsDeleteSelectChain(options.existing);
        }
        return drillsDeleteChain(options.deleted ?? { data: { id: "d1" }, error: null }, options.onDeleteEq);
      }
      if (table === "practice_block_drills") {
        return practiceBlockDrillsUsageChain(options.usageRows);
      }
      if (table === "drill_tag_map") {
        if (!mapDeleteDone) {
          mapDeleteDone = true;
          return drillTagMapDeleteChain();
        }
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

function updateFormData(drillId: string) {
  const fd = new FormData();
  fd.set("drill_id", drillId);
  fd.set("name", "Updated drill");
  fd.set("goal_tag_id", "tag-goal-1");
  fd.set("drill_type", "team");
  fd.set("default_duration_minutes", "12");
  fd.set("frequency", "none");
  fd.set("notes", "notes");
  fd.append("tag_ids", "tag-detail-1");
  return fd;
}

function archiveFormData(drillId: string) {
  const fd = new FormData();
  fd.set("drill_id", drillId);
  return fd;
}

function deleteFormData(drillId: string) {
  const fd = new FormData();
  fd.set("drill_id", drillId);
  return fd;
}

describe("drill actions sport_key enforcement", () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear();
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(createClient).mockReset();
    vi.mocked(getUserSubscriptionPlan).mockReset();
    vi.mocked(getUserSubscriptionPlan).mockResolvedValue({ plan_type: "paid" } as never);
    mockTeamState.team = { id: "team-1", name: "Varsity", sport_key: "basketball" };
  });

  it("updateDrill cannot edit another sport's drill (existing row not found)", async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildUpdateDrillClient({
        existing: { data: null, error: null },
      }) as never,
    );

    await expect(updateDrill(updateFormData("drill-soccer-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(
      expect.stringContaining("Drill%20not%20found%20or%20access%20denied"),
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("updateDrill same-sport valid action passes", async () => {
    const existingRow = {
      id: "drill-bball-1",
      source_type: "coach",
      primary_goal_slug: "offense",
      is_active: true,
    };
    const eqArgs: [string, unknown][] = [];
    vi.mocked(createClient).mockResolvedValue(
      buildUpdateDrillClient({
        existing: { data: existingRow, error: null },
        updated: { data: { id: "drill-bball-1" }, error: null },
        onUpdateEq: (field, value) => {
          eqArgs.push([field, value]);
        },
      }) as never,
    );

    await expect(updateDrill(updateFormData("drill-bball-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(
      expect.stringMatching(/Drill%20updated|openDrill=/),
    );
    expect(eqArgs).toEqual(
      expect.arrayContaining([
        ["id", "drill-bball-1"],
        ["owner_user_id", mockUser.id],
        ["sport_key", "basketball"],
        ["is_active", true],
      ]),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/app/drills");
    expect(revalidatePath).toHaveBeenCalledWith("/app/practices");
  });

  it("archiveDrill cannot archive another sport's drill (query still scopes sport_key)", async () => {
    const eqArgs: [string, unknown][] = [];
    vi.mocked(createClient).mockResolvedValue(
      buildDrillsArchiveRestoreClient((field, value) => {
        eqArgs.push([field, value]);
      }) as never,
    );

    await expect(archiveDrill(archiveFormData("drill-soccer-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining("Drill%20archived"));
    expect(eqArgs).toEqual(
      expect.arrayContaining([
        ["id", "drill-soccer-1"],
        ["owner_user_id", mockUser.id],
        ["sport_key", "basketball"],
      ]),
    );
  });

  it("archiveDrill same-sport valid action passes", async () => {
    vi.mocked(createClient).mockResolvedValue(buildDrillsArchiveRestoreClient() as never);

    await expect(archiveDrill(archiveFormData("drill-bball-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining("Drill%20archived"));
    expect(revalidatePath).toHaveBeenCalledWith("/app/drills");
  });

  it("restoreDrill cannot restore another sport's drill (query still scopes sport_key)", async () => {
    const eqArgs: [string, unknown][] = [];
    vi.mocked(createClient).mockResolvedValue(
      buildDrillsArchiveRestoreClient((field, value) => {
        eqArgs.push([field, value]);
      }) as never,
    );

    await expect(restoreDrill(archiveFormData("drill-soccer-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining("Drill%20restored"));
    expect(eqArgs).toEqual(
      expect.arrayContaining([
        ["id", "drill-soccer-1"],
        ["owner_user_id", mockUser.id],
        ["sport_key", "basketball"],
      ]),
    );
  });

  it("restoreDrill same-sport valid action passes", async () => {
    vi.mocked(createClient).mockResolvedValue(buildDrillsArchiveRestoreClient() as never);

    await expect(restoreDrill(archiveFormData("drill-bball-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining("Drill%20restored"));
    expect(revalidatePath).toHaveBeenCalledWith("/app/drills");
  });

  it("updateDrill uses current team sport_key on the update filter", async () => {
    mockTeamState.team.sport_key = "soccer";
    const eqArgs: [string, unknown][] = [];
    vi.mocked(createClient).mockResolvedValue(
      buildUpdateDrillClient({
        existing: {
          data: { id: "drill-soccer-1", source_type: "copied", primary_goal_slug: "offense", is_active: true },
          error: null,
        },
        updated: { data: { id: "drill-soccer-1" }, error: null },
        onUpdateEq: (field, value) => eqArgs.push([field, value]),
      }) as never,
    );

    await expect(updateDrill(updateFormData("drill-soccer-1"))).rejects.toThrow("redirect:");
    expect(eqArgs).toEqual(expect.arrayContaining([["sport_key", "soccer"]]));
  });

  it("deleteDrill blocks deletion when drill is used in saved practices", async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildDeleteDrillClient({
        existing: { data: { id: "drill-bball-1" }, error: null },
        usageRows: [{ id: "pbd-1" }],
      }) as never,
    );

    await expect(deleteDrill(deleteFormData("drill-bball-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(
      expect.stringContaining("This%20drill%20is%20used%20in%20saved%20practices.%20Archive%20it%20instead."),
    );
  });

  it("deleteDrill cannot delete system/wrong-sport/other-owner drills when scoped row is not found", async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildDeleteDrillClient({
        existing: { data: null, error: null },
        usageRows: [],
      }) as never,
    );

    await expect(deleteDrill(deleteFormData("drill-locked-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(
      expect.stringContaining("Drill%20not%20found%20or%20cannot%20be%20deleted."),
    );
  });

  it("deleteDrill same-sport coach/copied unused drill deletes with ownership filters", async () => {
    const eqArgs: [string, unknown][] = [];
    vi.mocked(createClient).mockResolvedValue(
      buildDeleteDrillClient({
        existing: { data: { id: "drill-bball-1" }, error: null },
        usageRows: [],
        deleted: { data: { id: "drill-bball-1" }, error: null },
        onDeleteEq: (field, value) => eqArgs.push([field, value]),
      }) as never,
    );

    await expect(deleteDrill(deleteFormData("drill-bball-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining("Drill%20deleted."));
    expect(eqArgs).toEqual(
      expect.arrayContaining([
        ["id", "drill-bball-1"],
        ["owner_user_id", mockUser.id],
        ["sport_key", "basketball"],
        ["is_active", true],
      ]),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/app/drills");
  });

  it("updateDrill rejects removed main goals such as situational", async () => {
    const invalidGoalRows = [
      { id: "tag-goal-1", category: "universal", tag_slug: "situational" },
      { id: "tag-detail-1", category: "sport_specific", tag_slug: "passing" },
    ];
    vi.mocked(createClient).mockResolvedValue(
      {
        from(table: string) {
          if (table === "sport_tags") {
            const chain: Record<string, unknown> = {};
            chain.select = () => chain;
            chain.eq = () => chain;
            chain.in = () => Promise.resolve({ data: invalidGoalRows, error: null });
            return chain;
          }
          throw new Error(`unexpected table ${table}`);
        },
      } as never,
    );

    await expect(updateDrill(updateFormData("drill-bball-1"))).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(
      expect.stringContaining("Practice%20goal%20must%20use%20a%20valid%20goal%20category."),
    );
  });

  it("createDrill rejects non-sport-specific tags as skills", async () => {
    vi.mocked(createClient).mockResolvedValue(
      {
        from(table: string) {
          if (table === "sport_tags") {
            const chain: Record<string, unknown> = {};
            chain.select = () => chain;
            chain.eq = () => chain;
            chain.in = () =>
              Promise.resolve({
                data: [
                  { id: "tag-goal-1", category: "universal", tag_slug: "offense" },
                  { id: "tag-bad-additional", category: "universal", tag_slug: "defense" },
                ],
                error: null,
              });
            return chain;
          }
          throw new Error(`unexpected table ${table}`);
        },
      } as never,
    );

    const fd = new FormData();
    fd.set("name", "Bad additional");
    fd.set("goal_tag_id", "tag-goal-1");
    fd.set("drill_type", "team");
    fd.set("default_duration_minutes", "10");
    fd.set("frequency", "none");
    fd.append("tag_ids", "tag-bad-additional");
    await expect(createDrill(fd)).rejects.toThrow("redirect:");
    expect(redirect).toHaveBeenCalledWith(
      expect.stringContaining("Skill%20tags%20must%20be%20sport-specific%20skills."),
    );
  });

  it("createDrill persists primary_goal_slug separately and additional tags only", async () => {
    let insertedDrill: Record<string, unknown> | null = null;
    let insertedMapRows: Array<{ drill_id: string; tag_id: string }> = [];
    vi.mocked(createClient).mockResolvedValue(
      {
        from(table: string) {
          if (table === "sport_tags") {
            const chain: Record<string, unknown> = {};
            chain.select = () => chain;
            chain.eq = () => chain;
            chain.in = () =>
              Promise.resolve({
                data: [
                  { id: "tag-goal-1", category: "universal", tag_slug: "offense" },
                  { id: "tag-detail-1", category: "sport_specific", tag_slug: "passing" },
                ],
                error: null,
              });
            return chain;
          }
          if (table === "drills") {
            return {
              insert: (values: Record<string, unknown>) => {
                insertedDrill = values;
                return {
                  select: () => ({
                    single: () => Promise.resolve({ data: { id: "created-1" }, error: null }),
                  }),
                };
              },
            };
          }
          if (table === "drill_tag_map") {
            return {
              insert: (rows: Array<{ drill_id: string; tag_id: string }>) => {
                insertedMapRows = rows;
                return Promise.resolve({ error: null });
              },
            };
          }
          throw new Error(`unexpected table ${table}`);
        },
      } as never,
    );

    const fd = new FormData();
    fd.set("name", "Create with goal");
    fd.set("goal_tag_id", "tag-goal-1");
    fd.set("drill_type", "team");
    fd.set("default_duration_minutes", "10");
    fd.set("frequency", "none");
    fd.append("tag_ids", "tag-detail-1");

    await expect(createDrill(fd)).rejects.toThrow("redirect:");
    expect(insertedDrill?.["primary_goal_slug"]).toBe("offense");
    expect(insertedMapRows).toEqual([{ drill_id: "created-1", tag_id: "tag-detail-1" }]);
  });

  it("updateDrill persists updated primary_goal_slug separately", async () => {
    let updatedValues: Record<string, unknown> | null = null;
    vi.mocked(createClient).mockResolvedValue(
      buildUpdateDrillClient({
        existing: { data: { id: "drill-bball-1", source_type: "coach", primary_goal_slug: "offense", is_active: true }, error: null },
        updated: { data: { id: "drill-bball-1" }, error: null },
        onUpdateValues: (values) => {
          updatedValues = values;
        },
      }) as never,
    );

    await expect(updateDrill(updateFormData("drill-bball-1"))).rejects.toThrow("redirect:");
    expect(updatedValues?.["primary_goal_slug"]).toBe("offense");
  });

  it("copySystemDrillToMyDrills copies primary_goal_slug from source drill", async () => {
    let copiedInsert: Record<string, unknown> | null = null;
    vi.mocked(createClient).mockResolvedValue(
      {
        from(table: string) {
          if (table === "drills") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    eq: () => ({
                      maybeSingle: () =>
                        Promise.resolve({
                          data: {
                            id: "sys-1",
                            sport_key: "basketball",
                            source_type: "system",
                            name: "System drill",
                            primary_goal_slug: "defense",
                            drill_type: "team",
                            default_duration_minutes: 10,
                            notes: null,
                            drill_tag_map: [],
                          },
                          error: null,
                        }),
                    }),
                  }),
                }),
              }),
              insert: (values: Record<string, unknown>) => {
                copiedInsert = values;
                return { select: () => ({ single: () => Promise.resolve({ data: { id: "copy-1" }, error: null }) }) };
              },
            };
          }
          if (table === "drill_tag_map") {
            return { insert: () => Promise.resolve({ error: null }) };
          }
          throw new Error(`unexpected table ${table}`);
        },
      } as never,
    );

    const fd = new FormData();
    fd.set("source_drill_id", "sys-1");
    await expect(copySystemDrillToMyDrills(fd)).rejects.toThrow("redirect:");
    expect(copiedInsert?.["primary_goal_slug"]).toBe("defense");
  });

  it("copySystemDrillToMyDrills applies drill_type fallback when source primary goal missing", async () => {
    let copiedInsert: Record<string, unknown> | null = null;
    vi.mocked(createClient).mockResolvedValue(
      {
        from(table: string) {
          if (table === "drills") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    eq: () => ({
                      maybeSingle: () =>
                        Promise.resolve({
                          data: {
                            id: "sys-2",
                            sport_key: "basketball",
                            source_type: "system",
                            name: "System warmup",
                            primary_goal_slug: null,
                            drill_type: "warmup",
                            default_duration_minutes: 10,
                            notes: null,
                            drill_tag_map: [],
                          },
                          error: null,
                        }),
                    }),
                  }),
                }),
              }),
              insert: (values: Record<string, unknown>) => {
                copiedInsert = values;
                return { select: () => ({ single: () => Promise.resolve({ data: { id: "copy-2" }, error: null }) }) };
              },
            };
          }
          if (table === "drill_tag_map") {
            return { insert: () => Promise.resolve({ error: null }) };
          }
          throw new Error(`unexpected table ${table}`);
        },
      } as never,
    );

    const fd = new FormData();
    fd.set("source_drill_id", "sys-2");
    await expect(copySystemDrillToMyDrills(fd)).rejects.toThrow("redirect:");
    expect(copiedInsert?.["primary_goal_slug"]).toBe("warmup");
  });
});
