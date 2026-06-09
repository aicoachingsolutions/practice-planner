"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { archiveDrill, deleteDrill, updateDrill } from "@/app/app/drills/actions";
import { DrillForm, type DrillEditInitial } from "@/app/app/drills/drill-form";
import {
  DRILL_LIST_ZONE_FILTERS,
  isValidPlacementZone,
  PLACEMENT_ZONE_SHORT_LABELS,
  type PlacementZone,
} from "@/lib/drill-goal-model";

type SportTag = {
  id: string;
  tag_name: string;
  tag_slug: string;
  category: string | null;
};

type DrillTagMapEntry = {
  tag_id: string;
  sport_tags: SportTag | SportTag[] | null;
};

export type CoachDrillForManager = {
  id: string;
  name: string;
  source_type: string;
  primary_goal_slug: string;
  placement_zone: string | null;
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
  drill_tag_map: DrillTagMapEntry[] | null;
};

type TagOption = {
  id: string;
  tag_name: string;
  tag_slug: string;
  category: string | null;
};

type DrillSetupFields = {
  player_count?: string | null;
  equipment?: string | null;
  setup_instructions?: string | null;
  how_to_run?: string | null;
  coaching_points?: string | null;
};

function tagFromMapping(mapping: DrillTagMapEntry): SportTag | null {
  const raw = mapping.sport_tags;
  if (!raw) {
    return null;
  }
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function getVisibleTags(mappings: DrillTagMapEntry[] | null): SportTag[] {
  if (!mappings?.length) {
    return [];
  }

  const tags = mappings
    .map(tagFromMapping)
    .filter((tag): tag is SportTag => Boolean(tag))
    .sort((left, right) => {
      const leftScore = left.category === "universal" ? 0 : 1;
      const rightScore = right.category === "universal" ? 0 : 1;
      return leftScore - rightScore || left.tag_name.localeCompare(right.tag_name);
    });

  const seen = new Set<string>();
  return tags.filter((tag) => {
    if (seen.has(tag.id)) {
      return false;
    }
    seen.add(tag.id);
    return true;
  });
}

function buildEditInitial(drill: CoachDrillForManager, tags: TagOption[]): DrillEditInitial {
  const goal = tags.find((tag) => tag.tag_slug === drill.primary_goal_slug && tag.category === "universal");
  const mapIds = [...new Set((drill.drill_tag_map ?? []).map((m) => m.tag_id))];
  const additionalTagIds = mapIds.filter((id) => {
    const tag = tags.find((candidate) => candidate.id === id);
    return Boolean(tag && tag.category === "sport_specific");
  });

  return {
    drillId: drill.id,
    name: drill.name,
    goalTagId: goal?.id ?? "",
    placementZone: drill.placement_zone ?? "general",
    drillType: drill.drill_type,
    durationMinutes: drill.default_duration_minutes,
    frequency: drill.frequency,
    priorityHigh: drill.priority >= 5,
    additionalTagIds,
    notes: drill.notes ?? "",
  };
}

function formatDrillType(drillType: string): string {
  return drillType.replace(/_/g, " ");
}

function formatZoneLabel(placementZone: string | null): string {
  if (placementZone && isValidPlacementZone(placementZone)) {
    return PLACEMENT_ZONE_SHORT_LABELS[placementZone];
  }
  return PLACEMENT_ZONE_SHORT_LABELS.general;
}

function getPlacementZone(placementZone: string | null): PlacementZone {
  if (placementZone && isValidPlacementZone(placementZone)) {
    return placementZone;
  }
  return "general";
}

function formatFrequencyCompact(frequency: string): string | null {
  switch (frequency) {
    case "none":
      return null;
    case "every_practice":
      return "every practice";
    case "weekly_1":
      return "1x/week";
    case "weekly_2":
      return "2x/week";
    case "weekly_3":
      return "3x/week";
    default:
      return frequency.replace(/_/g, " ");
  }
}

function formatFrequencyDetail(frequency: string): string {
  switch (frequency) {
    case "none":
      return "None";
    case "every_practice":
      return "Every practice";
    case "weekly_1":
      return "Weekly 1";
    case "weekly_2":
      return "Weekly 2";
    case "weekly_3":
      return "Weekly 3";
    default:
      return frequency.replace(/_/g, " ");
  }
}

type FrequencyFilter = "all" | "has" | "none";
type ZoneFilter = "all" | PlacementZone;

const FREQUENCY_FILTERS: { value: FrequencyFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "has", label: "Has frequency" },
  { value: "none", label: "No frequency" },
];

type ActiveDrillsManagerProps = {
  drills: CoachDrillForManager[];
  tags: TagOption[];
  openDrillId?: string;
};

function getSetupField(drill: CoachDrillForManager, key: keyof DrillSetupFields): string {
  const value = drill[key];
  return typeof value === "string" ? value.trim() : "";
}

function getBulletLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("\u2022 ") ? line.slice(2).trim() : line));
}

function DrillDetailText({ value }: { value: string }) {
  const trimmed = value.trim();

  if (trimmed.startsWith("\u2022 ")) {
    return (
      <ul className="dl-detail-bullets">
        {getBulletLines(trimmed).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    );
  }

  return <p className="dl-detail-text">{trimmed}</p>;
}

export function ActiveDrillsManager({ drills, tags, openDrillId }: ActiveDrillsManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyFilter>("all");
  const [drawerMode, setDrawerMode] = useState<"detail" | "edit">("detail");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (openDrillId && drills.some((d) => d.id === openDrillId)) {
      return openDrillId;
    }
    return null;
  });

  const queryLower = query.trim().toLowerCase();

  const filteredDrills = useMemo(() => {
    return drills.filter((drill) => {
      if (queryLower && !drill.name.toLowerCase().includes(queryLower)) {
        return false;
      }
      if (zoneFilter !== "all") {
        if (getPlacementZone(drill.placement_zone) !== zoneFilter) {
          return false;
        }
      }
      if (frequencyFilter === "has" && drill.frequency === "none") {
        return false;
      }
      if (frequencyFilter === "none" && drill.frequency !== "none") {
        return false;
      }
      return true;
    });
  }, [drills, queryLower, zoneFilter, frequencyFilter]);

  const selectedDrill = useMemo(
    () => (selectedId ? drills.find((d) => d.id === selectedId) ?? null : null),
    [drills, selectedId],
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setDrawerMode("detail");
  }, []);

  const confirmDelete = useCallback((event: FormEvent<HTMLFormElement>) => {
    const ok = window.confirm(
      "Delete this drill permanently? This cannot be undone. If it is used in saved practices, deletion will be blocked and you can archive it instead.",
    );
    if (!ok) {
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    if (!openDrillId || !drills.some((d) => d.id === openDrillId)) {
      return;
    }
    setSelectedId(openDrillId);
    setDrawerMode("detail");
    const params = new URLSearchParams(window.location.search);
    if (params.has("openDrill")) {
      params.delete("openDrill");
      const qs = params.toString();
      router.replace(qs ? `/app/drills?${qs}` : "/app/drills", { scroll: false });
    }
  }, [openDrillId, drills, router]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (drawerMode === "edit") {
          setDrawerMode("detail");
        } else {
          closeDetail();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, drawerMode, closeDetail]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const isSheetViewport = window.matchMedia("(max-width: 719px)").matches;
    if (!isSheetViewport) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedId]);

  useEffect(() => {
    setDrawerMode("detail");
  }, [selectedId]);

  if (drills.length === 0) {
    return (
      <div className="dl-manager">
        <div className="dl-empty" role="status">
          <p>No drills saved yet. Create your first drill or copy one from the Library.</p>
          <span>Use Add drill or Starter Library to build your practice-ready list.</span>
        </div>
        <a className="dl-fab" href="/app/drills?new=1" aria-label="Add drill">
          +
        </a>
      </div>
    );
  }

  return (
    <div className="dl-manager">
      <div className="dl-toolbar">
        <label className="dl-search-label">
          <span className="sr-only">Search drills by name</span>
          <input
            className="input dl-search"
            type="search"
            name="active-drills-search"
            placeholder="Search drills by name..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="dl-chip-row" role="group" aria-label="Filter by practice zone">
          {DRILL_LIST_ZONE_FILTERS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`dl-filter-chip${zoneFilter === chip.value ? " is-active" : ""}`}
              onClick={() => setZoneFilter(chip.value)}
              aria-pressed={zoneFilter === chip.value}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="dl-chip-row dl-chip-row-compact" role="group" aria-label="Filter by frequency">
          {FREQUENCY_FILTERS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`dl-filter-chip dl-filter-chip-small${frequencyFilter === chip.value ? " is-active" : ""}`}
              onClick={() => setFrequencyFilter(chip.value)}
              aria-pressed={frequencyFilter === chip.value}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {filteredDrills.length === 0 ? (
        <div className="dl-empty" role="status">
          <p>No drills match your search or filters.</p>
          <span>Clear a chip or shorten the search to widen the list.</span>
        </div>
      ) : (
        <ul className="dl-list">
          {filteredDrills.map((drill) => {
            const metaParts: string[] = [
              formatDrillType(drill.drill_type),
              `${drill.default_duration_minutes} min`,
              formatZoneLabel(drill.placement_zone),
            ];

            const isSelected = drill.id === selectedId;
            const visibleTags = getVisibleTags(drill.drill_tag_map);
            const tagsToShow = visibleTags.slice(0, 3);
            const extraTagCount = Math.max(0, visibleTags.length - tagsToShow.length);

            return (
              <li key={drill.id}>
                <button
                  type="button"
                  className={`dl-row${isSelected ? " is-selected" : ""}`}
                  onClick={() => setSelectedId(drill.id)}
                >
                  <span className="dl-row-main">
                    <span className="dl-row-name">{drill.name}</span>
                    <span className="dl-row-meta">{metaParts.join(" · ")}</span>
                  </span>
                  {tagsToShow.length > 0 ? (
                    <span className="dl-row-tags" aria-label="Drill tags">
                      {tagsToShow.map((tag) => (
                        <span className="dl-tag" key={tag.id}>
                          {tag.tag_name}
                        </span>
                      ))}
                      {extraTagCount > 0 ? <span className="dl-tag">+{extraTagCount} more</span> : null}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedDrill ? (
        <>
          <div
            className="dl-detail-backdrop"
            onClick={closeDetail}
            aria-hidden="true"
          />
          <aside
            className="dl-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drill-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dl-detail-handle" aria-hidden="true" />
            <header className="dl-detail-header">
              <div>
                <h3 id="drill-detail-title">
                  {drawerMode === "edit" ? "Edit drill" : selectedDrill.name}
                </h3>
                {drawerMode === "edit" ? (
                  <p className="dl-detail-subtitle">{selectedDrill.name}</p>
                ) : null}
              </div>
              <div className="dl-detail-header-actions">
                {drawerMode === "edit" ? (
                  <button
                    type="button"
                    className="dl-detail-close"
                    onClick={() => setDrawerMode("detail")}
                  >
                    Cancel
                  </button>
                ) : null}
                <button type="button" className="dl-detail-close" onClick={closeDetail}>
                  Close
                </button>
              </div>
            </header>
            <div className="dl-detail-body">
              {drawerMode === "detail" ? (
                <>
                  <div className="dl-detail-meta-grid">
                    <div className="dl-detail-meta-item">
                      <p>Type</p>
                      <span>{formatDrillType(selectedDrill.drill_type)}</span>
                    </div>
                    <div className="dl-detail-meta-item">
                      <p>Duration</p>
                      <span>{selectedDrill.default_duration_minutes} min</span>
                    </div>
                    <div className="dl-detail-meta-item">
                      <p>Zone</p>
                      <span>{formatZoneLabel(selectedDrill.placement_zone)}</span>
                    </div>
                    <div className="dl-detail-meta-item">
                      <p>Frequency</p>
                      <span>{formatFrequencyDetail(selectedDrill.frequency)}</span>
                    </div>
                    <div className="dl-detail-meta-item">
                      <p>Priority</p>
                      <span>{selectedDrill.priority >= 5 ? "Marked priority" : "Standard"}</span>
                    </div>
                  </div>

                  {(() => {
                    const visibleTags = getVisibleTags(selectedDrill.drill_tag_map);
                    const goalTag = tags.find(
                      (tag) => tag.tag_slug === selectedDrill.primary_goal_slug && tag.category === "universal",
                    );
                    const otherTags = visibleTags.filter((tag) => tag.category === "sport_specific");
                    const playerCount = getSetupField(selectedDrill, "player_count");
                    const equipment = getSetupField(selectedDrill, "equipment");
                    const setup = getSetupField(selectedDrill, "setup_instructions");
                    const howToRun = getSetupField(selectedDrill, "how_to_run");
                    const coachingPoints = getSetupField(selectedDrill, "coaching_points");
                    const hasSetup = Boolean(playerCount || equipment || setup || howToRun);

                    return (
                      <>
                        {goalTag ? (
                          <details className="dl-detail-section" open>
                            <summary>Practice goal</summary>
                            <div className="dl-detail-chip-wrap">
                              <span className="chip accent">{goalTag.tag_name}</span>
                            </div>
                          </details>
                        ) : null}
                        {otherTags.length > 0 ? (
                          <details className="dl-detail-section" open>
                            <summary>Tags</summary>
                            <div className="dl-detail-chip-wrap">
                              {otherTags.map((tag) => (
                                <span className="chip" key={tag.id}>
                                  {tag.tag_name}
                                </span>
                              ))}
                            </div>
                          </details>
                        ) : null}
                        {hasSetup ? (
                          <details className="dl-detail-section" open>
                            <summary>Setup</summary>
                            <div className="dl-detail-field-grid">
                              {playerCount ? (
                                <div className="dl-detail-field">
                                  <p>Player count</p>
                                  <span>{playerCount}</span>
                                </div>
                              ) : null}
                              {equipment ? (
                                <div className="dl-detail-field">
                                  <p>Equipment</p>
                                  <span>{equipment}</span>
                                </div>
                              ) : null}
                            </div>
                            {setup ? (
                              <div className="dl-detail-field">
                                <p>Setup</p>
                                <DrillDetailText value={setup} />
                              </div>
                            ) : null}
                            {howToRun ? (
                              <div className="dl-detail-field">
                                <p>How to run</p>
                                <DrillDetailText value={howToRun} />
                              </div>
                            ) : null}
                          </details>
                        ) : null}
                        {coachingPoints ? (
                          <details className="dl-detail-section" open>
                            <summary>Coaching points</summary>
                            <DrillDetailText value={coachingPoints} />
                          </details>
                        ) : null}
                      </>
                    );
                  })()}

                  {selectedDrill.notes ? (
                    <details className="dl-detail-section" open>
                      <summary>Notes</summary>
                      <DrillDetailText value={selectedDrill.notes} />
                    </details>
                  ) : null}

                  <div className="dl-detail-actions">
                    <button
                      type="button"
                      className="button-inline"
                      onClick={() => setDrawerMode("edit")}
                    >
                      Edit drill
                    </button>
                    <form action={archiveDrill}>
                      <input type="hidden" name="drill_id" value={selectedDrill.id} />
                      <button className="button-inline" type="submit">
                        Archive drill
                      </button>
                    </form>
                    <form action={deleteDrill} onSubmit={confirmDelete}>
                      <input type="hidden" name="drill_id" value={selectedDrill.id} />
                      <button className="button-inline danger-link" type="submit">
                        Delete drill
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <DrillForm
                    tags={tags}
                    action={updateDrill}
                    edit={buildEditInitial(selectedDrill, tags)}
                  />
                  <div className="dl-detail-actions">
                    <form action={archiveDrill}>
                      <input type="hidden" name="drill_id" value={selectedDrill.id} />
                      <button className="button-inline" type="submit">
                        Archive drill
                      </button>
                    </form>
                    <form action={deleteDrill} onSubmit={confirmDelete}>
                      <input type="hidden" name="drill_id" value={selectedDrill.id} />
                      <button className="button-inline danger-link" type="submit">
                        Delete drill
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </aside>
        </>
      ) : null}
      <a className="dl-fab" href="/app/drills?new=1" aria-label="Add drill">
        +
      </a>
    </div>
  );
}
