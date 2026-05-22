import { describe, expect, it } from "vitest";
import {
  parseStatsSummary,
  validateAiPracticePlan,
  type AiGenerationCandidate,
  type AiPracticeBlockContext,
} from "./ai-practice-generator";

function candidate(overrides: Partial<AiGenerationCandidate> & Pick<AiGenerationCandidate, "id" | "name">): AiGenerationCandidate {
  return {
    owner_user_id: "user-1",
    source_type: "coach",
    sport_key: "basketball",
    is_active: true,
    primary_goal_slug: "offense",
    placement_zone: "situational",
    drill_type: "team",
    default_duration_minutes: 10,
    priority: 3,
    frequency: "none",
    notes: null,
    drill_tag_map: [],
    ...overrides,
  };
}

const blocks: AiPracticeBlockContext[] = [
  {
    id: "block-1",
    block_name: "Special situations",
    planned_duration_minutes: 10,
    block_order: 0,
    placement_zone: "situational",
    focus_subcategory_tag_slug: null,
  },
];

describe("validateAiPracticePlan", () => {
  it("accepts basketball BLOB and SLOB situations", () => {
    const out = validateAiPracticePlan({
      sportKey: "basketball",
      targetDurationMinutes: 10,
      blocks,
      candidates: [candidate({ id: "d-1", name: "BLOB stack" })],
      plan: {
        blocks: [
          {
            practice_block_id: "block-1",
            segments: [
              {
                drill_id: "d-1",
                duration_minutes: 10,
                placement_zone: "situational",
                situation_tag_slug: "blob",
                selection_reason: "prompt match",
              },
            ],
          },
        ],
      },
    });

    expect(out[0]?.ai_situation_tag_slug).toBe("blob");
  });

  it("rejects soccer receiving basketball-only BLOB/SLOB situations", () => {
    expect(() =>
      validateAiPracticePlan({
        sportKey: "soccer",
        targetDurationMinutes: 10,
        blocks,
        candidates: [candidate({ id: "d-1", name: "Corner kicks", sport_key: "soccer" })],
        plan: {
          blocks: [
            {
              practice_block_id: "block-1",
              segments: [
                {
                  drill_id: "d-1",
                  duration_minutes: 10,
                  placement_zone: "situational",
                  situation_tag_slug: "blob",
                },
              ],
            },
          ],
        },
      }),
    ).toThrow(/not allowed/);
  });

  it("rejects invented drill IDs", () => {
    expect(() =>
      validateAiPracticePlan({
        sportKey: "basketball",
        targetDurationMinutes: 10,
        blocks,
        candidates: [candidate({ id: "real", name: "Real" })],
        plan: {
          blocks: [
            {
              practice_block_id: "block-1",
              segments: [{ drill_id: "invented", duration_minutes: 10, placement_zone: "situational" }],
            },
          ],
        },
      }),
    ).toThrow(/candidate list/);
  });

  it("rejects wrong-sport drill IDs even if a candidate row is poisoned", () => {
    expect(() =>
      validateAiPracticePlan({
        sportKey: "basketball",
        targetDurationMinutes: 10,
        blocks,
        candidates: [candidate({ id: "soccer-drill", name: "Corners", sport_key: "soccer" })],
        plan: {
          blocks: [
            {
              practice_block_id: "block-1",
              segments: [{ drill_id: "soccer-drill", duration_minutes: 10, placement_zone: "situational" }],
            },
          ],
        },
      }),
    ).toThrow(/another sport/);
  });

  it("rejects duplicate drills unless repetition is explicitly allowed", () => {
    const plan = {
      blocks: [
        {
          practice_block_id: "block-1",
          segments: [
            { drill_id: "d-1", duration_minutes: 5, placement_zone: "situational" },
            { drill_id: "d-1", duration_minutes: 5, placement_zone: "situational" },
          ],
        },
      ],
    };

    expect(() =>
      validateAiPracticePlan({
        sportKey: "basketball",
        targetDurationMinutes: 10,
        blocks,
        candidates: [candidate({ id: "d-1", name: "Repeat" })],
        plan,
      }),
    ).toThrow(/repeated/);

    expect(
      validateAiPracticePlan({
        sportKey: "basketball",
        targetDurationMinutes: 10,
        blocks,
        candidates: [candidate({ id: "d-1", name: "Repeat" })],
        plan,
        allowDuplicateDrills: true,
      }),
    ).toHaveLength(2);
  });

  it("rejects duration totals that do not match the template target", () => {
    expect(() =>
      validateAiPracticePlan({
        sportKey: "basketball",
        targetDurationMinutes: 10,
        blocks,
        candidates: [],
        plan: {
          blocks: [
            {
              practice_block_id: "block-1",
              segments: [{ drill_id: null, segment_name: "Open teaching", duration_minutes: 8 }],
            },
          ],
        },
      }),
    ).toThrow(/duration/);
  });
});

describe("parseStatsSummary", () => {
  it("maps basketball turnovers to press break and decision-making signals", () => {
    expect(parseStatsSummary("basketball", "18 turnovers against pressure")?.signals).toEqual([
      "ball handling",
      "decision-making",
      "press break",
    ]);
  });

  it("maps volleyball aces allowed to serve receive", () => {
    expect(parseStatsSummary("volleyball", "Allowed 11 aces")?.signals).toContain("serve receive");
  });
});
