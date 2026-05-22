"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";

export type DrillSheetOption = {
  id: string;
  name: string;
  drill_type: string;
  default_duration_minutes: number;
  placement_zone?: string | null;
};

export type DrillPickerSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Called when the user picks a drill. The picked drill's id is passed. */
  onPick: (drillId: string) => void;
  drills: DrillSheetOption[];
  /** Currently selected drill id, used to highlight the active option. */
  currentDrillId?: string | null;
  /** Optional zone filter applied by default (e.g. "offense"). Coach can clear it. */
  defaultZoneFilter?: string | null;
  /** Page title shown at the top of the sheet (e.g. "Change drill - Offense focus"). */
  title: string;
  /** Optional empty-state message when drills list is empty after filtering. */
  emptyState?: ReactNode;
};

const placementZoneOrder = [
  "warmup",
  "offense",
  "defense",
  "situational",
  "end_practice",
  "general",
] as const;

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function DrillPickerSheet({
  open,
  onClose,
  onPick,
  drills,
  currentDrillId = null,
  defaultZoneFilter = null,
  title,
  emptyState,
}: DrillPickerSheetProps): JSX.Element | null {
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState(defaultZoneFilter ?? "");

  useEffect(() => {
    if (open) {
      setSearch("");
      setZoneFilter(defaultZoneFilter ?? "");
    }
  }, [defaultZoneFilter, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const zoneOptions = useMemo(
    () => {
      const presentZones = new Set(
        drills
          .map((drill) => drill.placement_zone)
          .filter((zone): zone is string => Boolean(zone)),
      );

      return placementZoneOrder.filter((zone) => presentZones.has(zone));
    },
    [drills],
  );

  const filteredDrills = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return drills.filter((drill) => {
      if (zoneFilter && drill.placement_zone !== zoneFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return drill.name.toLowerCase().includes(normalizedSearch);
    });
  }, [drills, search, zoneFilter]);

  function handlePick(drillId: string) {
    onPick(drillId);
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="dps-root">
      <div className="dps-backdrop" onClick={onClose} />
      <section
        className="dps-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dps-title"
      >
        <div className="dps-handle" aria-hidden="true" />

        <header className="dps-header">
          <h3 id="dps-title">{title}</h3>
          <button type="button" className="dps-close" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="dps-controls">
          <label className="label">
            Search
            <input
              className="input dps-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search drills..."
            />
          </label>

          <div className="dps-chip-row" aria-label="Filter drills by placement zone">
            <button
              type="button"
              className={`dps-chip${zoneFilter ? "" : " selected"}`}
              onClick={() => setZoneFilter("")}
            >
              All
            </button>
            {zoneOptions.map((zone) => (
              <button
                type="button"
                className={`dps-chip${zoneFilter === zone ? " selected" : ""}`}
                key={zone}
                onClick={() => setZoneFilter((current) => (current === zone ? "" : zone))}
              >
                {formatLabel(zone)}
              </button>
            ))}
          </div>
        </div>

        <div className="dps-list-wrap">
          {filteredDrills.length === 0 ? (
            <div className="dps-empty">
              {emptyState ?? <p className="muted">No drills match these filters.</p>}
            </div>
          ) : (
            <ul className="dps-list">
              {filteredDrills.map((drill) => {
                const isSelected = drill.id === currentDrillId;

                return (
                  <li key={drill.id}>
                    <button
                      type="button"
                      className={`dps-option${isSelected ? " selected" : ""}`}
                      onClick={() => handlePick(drill.id)}
                    >
                      <span className="dps-option-main">
                        <span className="dps-option-name">{drill.name}</span>
                        {isSelected ? <span className="dps-check" aria-hidden="true">{"\u2713"}</span> : null}
                      </span>
                      <span className="dps-option-meta">
                        {formatLabel(drill.drill_type)}
                        {" \u2022 "}
                        {drill.default_duration_minutes} min
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="dps-footer">
          <button type="button" className="button-secondary dps-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
