"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { archiveDrill, deleteDrill, updateDrill } from "@/app/app/drills/actions";
import { DrillForm, type DrillEditInitial } from "@/app/app/drills/drill-form";
import {
  DRILL_LIST_ZONE_FILTERS,
  isMainPracticeGoalSlug,
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
  drill_tag_map: DrillTagMapEntry[] | null;
};

type TagOption = {
  id: string;
  tag_name: string;
  tag_slug: string;
  category: string | null;
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
    return Boolean(tag && !isMainPracticeGoalSlug(tag.tag_slug));
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

type TypeFilter = "all" | string;
type FrequencyFilter = "all" | "has" | "none";
type SourceFilter = "all" | "coach" | "copied";
type ZoneFilter = "all" | PlacementZone;

type ActiveDrillsManagerProps = {
  drills: CoachDrillForManager[];
  tags: TagOption[];
  openDrillId?: string;
};

export function ActiveDrillsManager({ drills, tags, openDrillId }: ActiveDrillsManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [drawerMode, setDrawerMode] = useState<"detail" | "edit">("detail");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (openDrillId && drills.some((d) => d.id === openDrillId)) {
      return openDrillId;
    }
    return null;
  });

  const drillTypes = useMemo(() => {
    const set = new Set<string>();
    for (const drill of drills) {
      set.add(drill.drill_type);
    }
    return Array.from(set).sort((a, b) => formatDrillType(a).localeCompare(formatDrillType(b)));
  }, [drills]);

  const queryLower = query.trim().toLowerCase();

  const filteredDrills = useMemo(() => {
    return drills.filter((drill) => {
      if (queryLower && !drill.name.toLowerCase().includes(queryLower)) {
        return false;
      }
      if (typeFilter !== "all" && drill.drill_type !== typeFilter) {
        return false;
      }
      if (zoneFilter !== "all") {
        const zone = isValidPlacementZone(drill.placement_zone ?? "")
          ? drill.placement_zone
          : "general";
        if (zone !== zoneFilter) {
          return false;
        }
      }
      if (frequencyFilter === "has" && drill.frequency === "none") {
        return false;
      }
      if (frequencyFilter === "none" && drill.frequency !== "none") {
        return false;
      }
      if (sourceFilter === "coach" && drill.source_type !== "coach") {
        return false;
      }
      if (sourceFilter === "copied" && drill.source_type !== "copied") {
        return false;
      }
      return true;
    });
  }, [drills, queryLower, typeFilter, zoneFilter, frequencyFilter, sourceFilter]);

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
      <div className="list-card active-drills-empty">
        <p className="muted">No drills saved yet. Create your first drill or copy one from the Library.</p>
      </div>
    );
  }

  return (
    <div className="active-drills-manager">
      <div className="active-drills-toolbar">
        <label className="active-drills-search-label">
          <span className="sr-only">Search drills by name</span>
          <input
            className="input"
            type="search"
            name="active-drills-search"
            placeholder="Search drills by name..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="drill-zone-chips" role="group" aria-label="Filter by practice zone">
          {DRILL_LIST_ZONE_FILTERS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`drill-zone-chip${zoneFilter === chip.value ? " active" : ""}`}
              onClick={() => setZoneFilter(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="active-drills-filters active-drills-filters-desktop">
          <select
            className="select active-drills-filter-select"
            aria-label="Filter by drill type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
          >
            <option value="all">All types</option>
            {drillTypes.map((type) => (
              <option key={type} value={type}>
                {formatDrillType(type)}
              </option>
            ))}
          </select>
          <select
            className="select active-drills-filter-select"
            aria-label="Filter by frequency"
            value={frequencyFilter}
            onChange={(event) => setFrequencyFilter(event.target.value as FrequencyFilter)}
          >
            <option value="all">All frequencies</option>
            <option value="has">Has frequency</option>
            <option value="none">No frequency</option>
          </select>
          <select
            className="select active-drills-filter-select"
            aria-label="Filter by source"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as SourceFilter)}
          >
            <option value="all">All sources</option>
            <option value="coach">Coach</option>
            <option value="copied">Copied</option>
          </select>
        </div>
      </div>

      {filteredDrills.length === 0 ? (
        <div className="list-card active-drills-empty">
          <p className="muted">No drills match your search or filters.</p>
        </div>
      ) : (
        <ul className="active-drills-rows">
          {filteredDrills.map((drill) => {
            const metaParts: string[] = [
              formatDrillType(drill.drill_type),
              `${drill.default_duration_minutes} min`,
              formatZoneLabel(drill.placement_zone),
            ];

            const isSelected = drill.id === selectedId;

            return (
              <li key={drill.id}>
                <button
                  type="button"
                  className={`active-drill-row${isSelected ? " selected" : ""}`}
                  onClick={() => setSelectedId(drill.id)}
                >
                  <span className="active-drill-row-name">{drill.name}</span>
                  <span className="active-drill-row-meta">{metaParts.join(" · ")}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedDrill ? (
        <>
          <div
            className="drill-detail-backdrop"
            onClick={closeDetail}
            aria-hidden="true"
          />
          <aside
            className="drill-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drill-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="drill-detail-header">
              <div>
                <h3 id="drill-detail-title">
                  {drawerMode === "edit" ? "Edit drill" : selectedDrill.name}
                </h3>
                {drawerMode === "edit" ? (
                  <p className="muted drill-detail-subtitle">{selectedDrill.name}</p>
                ) : null}
              </div>
              <div className="drill-detail-header-actions">
                {drawerMode === "edit" ? (
                  <button
                    type="button"
                    className="drill-detail-close"
                    onClick={() => setDrawerMode("detail")}
                  >
                    Cancel
                  </button>
                ) : null}
                <button type="button" className="drill-detail-close" onClick={closeDetail}>
                  Close
                </button>
              </div>
            </header>
            <div className="drill-detail-body">
              {drawerMode === "detail" ? (
                <>
                  <div className="drill-detail-section">
                    <p className="drill-detail-label">Source</p>
                    <p className="drill-detail-value">
                      {selectedDrill.source_type === "copied" ? "Copied" : "Coach"}
                    </p>
                  </div>
                  <div className="drill-detail-section">
                    <p className="drill-detail-label">Type</p>
                    <p className="drill-detail-value">{formatDrillType(selectedDrill.drill_type)}</p>
                  </div>
                  <div className="drill-detail-section">
                    <p className="drill-detail-label">Duration</p>
                    <p className="drill-detail-value">
                      {selectedDrill.default_duration_minutes} minutes
                    </p>
                  </div>
                  <div className="drill-detail-section">
                    <p className="drill-detail-label">Frequency</p>
                    <p className="drill-detail-value">
                      {formatFrequencyDetail(selectedDrill.frequency)}
                    </p>
                  </div>
                  <div className="drill-detail-section">
                    <p className="drill-detail-label">Priority</p>
                    <p className="drill-detail-value">
                      {selectedDrill.priority >= 5 ? "Marked priority" : "Standard"}
                    </p>
                  </div>

                  {(() => {
                    const visibleTags = getVisibleTags(selectedDrill.drill_tag_map);
                    const goalTag = tags.find(
                      (tag) => tag.tag_slug === selectedDrill.primary_goal_slug && tag.category === "universal",
                    );
                    const otherTags = visibleTags.filter((tag) => !isMainPracticeGoalSlug(tag.tag_slug));

                    return (
                      <>
                        {goalTag ? (
                          <div className="drill-detail-section">
                            <p className="drill-detail-label">Practice goal</p>
                            <div className="inline-meta">
                              <span className="chip accent">{goalTag.tag_name}</span>
                            </div>
                          </div>
                        ) : null}
                        {otherTags.length > 0 ? (
                          <div className="drill-detail-section">
                            <p className="drill-detail-label">Tags</p>
                            <div className="inline-meta">
                              {otherTags.map((tag) => (
                                <span className="chip" key={tag.id}>
                                  {tag.tag_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </>
                    );
                  })()}

                  {selectedDrill.notes ? (
                    <div className="drill-detail-section">
                      <p className="drill-detail-label">Notes</p>
                      <p className="drill-detail-notes">{selectedDrill.notes}</p>
                    </div>
                  ) : null}

                  <div className="drill-detail-actions">
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
                  <div className="drill-detail-actions">
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
    </div>
  );
}
