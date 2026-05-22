export type SportSituation = {
  sportKey: string;
  slug: string;
  label: string;
  placementZone: "situational" | "offense" | "defense" | "general" | "end_practice";
};

export const SPORT_SITUATIONS: Record<string, SportSituation[]> = {
  basketball: [
    { sportKey: "basketball", slug: "blob", label: "BLOB", placementZone: "situational" },
    { sportKey: "basketball", slug: "slob", label: "SLOB", placementZone: "situational" },
    { sportKey: "basketball", slug: "press_break", label: "Press break", placementZone: "situational" },
    { sportKey: "basketball", slug: "press_defense", label: "Press defense", placementZone: "situational" },
    { sportKey: "basketball", slug: "end_of_game", label: "End-of-game", placementZone: "situational" },
    { sportKey: "basketball", slug: "late_clock", label: "Late clock", placementZone: "situational" },
    { sportKey: "basketball", slug: "free_throw_pressure", label: "Free throw pressure", placementZone: "end_practice" },
    { sportKey: "basketball", slug: "ato", label: "ATO", placementZone: "situational" },
  ],
  soccer: [
    { sportKey: "soccer", slug: "corners", label: "Corners", placementZone: "situational" },
    { sportKey: "soccer", slug: "free_kicks", label: "Free kicks", placementZone: "situational" },
    { sportKey: "soccer", slug: "throw_ins", label: "Throw-ins", placementZone: "situational" },
    { sportKey: "soccer", slug: "penalties", label: "Penalties", placementZone: "situational" },
    { sportKey: "soccer", slug: "defending_set_pieces", label: "Defending set pieces", placementZone: "situational" },
    { sportKey: "soccer", slug: "build_out", label: "Build-out", placementZone: "general" },
    { sportKey: "soccer", slug: "transition", label: "Transition", placementZone: "general" },
    { sportKey: "soccer", slug: "finishing", label: "Finishing", placementZone: "offense" },
  ],
  volleyball: [
    { sportKey: "volleyball", slug: "serve_receive", label: "Serve receive", placementZone: "situational" },
    { sportKey: "volleyball", slug: "side_out", label: "Side-out", placementZone: "situational" },
    { sportKey: "volleyball", slug: "out_of_system", label: "Out-of-system", placementZone: "situational" },
    { sportKey: "volleyball", slug: "free_ball_transition", label: "Free ball transition", placementZone: "general" },
    { sportKey: "volleyball", slug: "rotations", label: "Rotations", placementZone: "situational" },
    { sportKey: "volleyball", slug: "end_set_pressure", label: "End-set pressure", placementZone: "end_practice" },
    { sportKey: "volleyball", slug: "coverage", label: "Coverage", placementZone: "defense" },
  ],
  baseball: [
    { sportKey: "baseball", slug: "first_and_third", label: "First-and-third", placementZone: "situational" },
    { sportKey: "baseball", slug: "bunt_defense", label: "Bunt defense", placementZone: "situational" },
    { sportKey: "baseball", slug: "rundowns", label: "Rundowns", placementZone: "situational" },
    { sportKey: "baseball", slug: "cutoffs_relays", label: "Cutoffs/relays", placementZone: "situational" },
    { sportKey: "baseball", slug: "tag_up", label: "Tag-up", placementZone: "situational" },
    { sportKey: "baseball", slug: "steal_defense", label: "Steal defense", placementZone: "situational" },
    { sportKey: "baseball", slug: "situational_hitting", label: "Situational hitting", placementZone: "situational" },
    { sportKey: "baseball", slug: "squeeze", label: "Squeeze", placementZone: "situational" },
    { sportKey: "baseball", slug: "pfp", label: "PFP", placementZone: "situational" },
  ],
  softball: [
    { sportKey: "softball", slug: "first_and_third", label: "First-and-third", placementZone: "situational" },
    { sportKey: "softball", slug: "bunt_defense", label: "Bunt defense", placementZone: "situational" },
    { sportKey: "softball", slug: "rundowns", label: "Rundowns", placementZone: "situational" },
    { sportKey: "softball", slug: "cutoffs_relays", label: "Cutoffs/relays", placementZone: "situational" },
    { sportKey: "softball", slug: "tag_up", label: "Tag-up", placementZone: "situational" },
    { sportKey: "softball", slug: "steal_defense", label: "Steal defense", placementZone: "situational" },
    { sportKey: "softball", slug: "situational_hitting", label: "Situational hitting", placementZone: "situational" },
    { sportKey: "softball", slug: "squeeze", label: "Squeeze", placementZone: "situational" },
    { sportKey: "softball", slug: "pfp", label: "PFP", placementZone: "situational" },
  ],
};

export function getSituationsForSport(sportKey: string): SportSituation[] {
  return SPORT_SITUATIONS[sportKey] ?? [];
}

export function isSituationAllowedForSport(sportKey: string, slug: string | null | undefined): boolean {
  if (!slug) {
    return true;
  }
  return getSituationsForSport(sportKey).some((situation) => situation.slug === slug);
}
