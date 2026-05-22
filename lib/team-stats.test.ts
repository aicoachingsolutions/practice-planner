import { describe, expect, it } from "vitest";
import { parseTeamStatsForSignals } from "./team-stats";

describe("parseTeamStatsForSignals", () => {
  it("keeps basketball stat signals team-level and normalized", () => {
    const parsed = parseTeamStatsForSignals(
      "basketball",
      "Turnovers, 18\nOffensive rebounds allowed, 12\nFree throws, 8/17",
    );

    expect(parsed?.values.map((value) => value.statKey)).toContain("turnovers");
    expect(parsed?.signals.map((signal) => signal.slug)).toEqual(
      expect.arrayContaining(["ball_handling", "decision_making", "press_break", "boxing_out", "rebounding"]),
    );
  });

  it("parses volleyball upload text into serve receive signals", () => {
    const parsed = parseTeamStatsForSignals("volleyball", "Aces allowed: 11");
    expect(parsed?.signals[0]?.slug).toBe("serve_receive");
  });

  it("normalizes common basketball CSV headers into stat categories", () => {
    const parsed = parseTeamStatsForSignals(
      "basketball",
      "Team,TO,Opp OREB,FT%\nUs,18,12,47%",
    );

    expect(parsed?.values.map((value) => value.statKey)).toEqual(
      expect.arrayContaining(["turnovers", "offensive_rebounds_allowed", "free_throws"]),
    );
    expect(parsed?.signals.map((signal) => signal.slug)).toEqual(
      expect.arrayContaining(["press_break", "rebounding", "free_throw_pressure"]),
    );
  });

  it("normalizes soccer, volleyball, and softball CSV aliases", () => {
    expect(
      parseTeamStatsForSignals("soccer", "Opponent,Opp Shots,Opp Corners\nCentral,19,8")?.signals.map(
        (signal) => signal.slug,
      ),
    ).toEqual(expect.arrayContaining(["defending", "defending_set_pieces"]));

    expect(
      parseTeamStatsForSignals("volleyball", "Opponent,Reception Errors,OOS\nCentral,9,14")?.signals.map(
        (signal) => signal.slug,
      ),
    ).toEqual(expect.arrayContaining(["serve_receive", "out_of_system"]));

    expect(
      parseTeamStatsForSignals("softball", "Opponent,E,SB\nCentral,4,5")?.signals.map((signal) => signal.slug),
    ).toEqual(expect.arrayContaining(["fielding", "steal_defense"]));
  });

  it("returns null when no stat text is supplied", () => {
    expect(parseTeamStatsForSignals("soccer", "  ")).toBeNull();
  });
});
