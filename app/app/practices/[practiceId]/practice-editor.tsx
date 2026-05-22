"use client";

import { useMemo, useState, useTransition } from "react";
import { DrillPickerSheet, type DrillSheetOption } from "./drill-picker-sheet";

type DrillOption = {
  id: string;
  name: string;
  drill_type: string;
  default_duration_minutes: number;
  placement_zone?: string | null;
};

type TemplateOption = {
  id: string;
  template_key: string;
  display_name: string;
};

type PracticeEntry = {
  /** practice_block_drills.id — present for persisted rows, null for unsaved/new rows */
  id: string | null;
  drillId: string | null;
  drillName?: string;
  segmentName: string;
  durationMinutes: number;
  notes: string;
};

type PracticeBlock = {
  blockName: string;
  startMinute: number;
  itemType: "warmup" | "focus_anchor" | "drill_gap";
  plannedDurationMinutes: number;
  templateId: string | null;
  entries: PracticeEntry[];
};

type Props = {
  practiceId: string;
  practiceDate: string;
  practiceType: string;
  targetDuration: number;
  focusNotes: string;
  notes: string;
  blocks: PracticeBlock[];
  availableDrills: DrillOption[];
  templateOptions: TemplateOption[];
  saveAction: (formData: FormData) => void;
  duplicateAction: (formData: FormData) => void;
  /** Server action that swaps the drill on a single saved segment. Optional for backward compat. */
  swapDrillAction?: (formData: FormData) => void;
  sportKey: string;
  error?: string;
};

const quickAddBySport: Record<string, Array<{ label: string; blockName: string; zone: string }>> = {
  basketball: [
    { label: "Add BLOB/SLOB", blockName: "BLOB / SLOB situations", zone: "situational" },
    { label: "Add press break", blockName: "Press break", zone: "situational" },
    { label: "Add end-game", blockName: "End-of-game situations", zone: "situational" },
  ],
  soccer: [
    { label: "Add set pieces", blockName: "Set pieces", zone: "situational" },
    { label: "Add throw-ins", blockName: "Throw-ins", zone: "situational" },
    { label: "Add transition", blockName: "Transition", zone: "general" },
  ],
  volleyball: [
    { label: "Add serve receive", blockName: "Serve receive", zone: "situational" },
    { label: "Add side-out", blockName: "Side-out", zone: "situational" },
    { label: "Add out-of-system", blockName: "Out-of-system", zone: "situational" },
  ],
  baseball: [
    { label: "Add bunt defense", blockName: "Bunt defense", zone: "situational" },
    { label: "Add first-and-third", blockName: "First-and-third", zone: "situational" },
    { label: "Add rundowns", blockName: "Rundowns", zone: "situational" },
    { label: "Add cutoffs/relays", blockName: "Cutoffs / relays", zone: "situational" },
  ],
  softball: [
    { label: "Add bunt defense", blockName: "Bunt defense", zone: "situational" },
    { label: "Add first-and-third", blockName: "First-and-third", zone: "situational" },
    { label: "Add rundowns", blockName: "Rundowns", zone: "situational" },
    { label: "Add cutoffs/relays", blockName: "Cutoffs / relays", zone: "situational" },
  ],
};

function createEmptyEntry(): PracticeEntry {
  return {
    id: null,
    drillId: null,
    segmentName: "",
    durationMinutes: 10,
    notes: "",
  };
}

function createEmptyBlock(): PracticeBlock {
  return {
    blockName: "New block",
    startMinute: 0,
    itemType: "drill_gap",
    plannedDurationMinutes: 15,
    templateId: null,
    entries: [],
  };
}

function formatMinuteRange(startMinute: number, durationMinutes: number) {
  return `${startMinute}:00-${startMinute + durationMinutes}:00`;
}

/** Lightweight block-name → placement_zone inference, used to pre-filter the drill picker chip. */
function inferBlockZone(blockName: string): string | null {
  const lower = blockName.toLowerCase();
  if (lower.includes("warmup") || lower.includes("warm up")) return "warmup";
  if (lower.includes("end of practice") || lower.includes("end practice")) return "end_practice";
  if (lower.includes("offense")) return "offense";
  if (lower.includes("defense")) return "defense";
  if (
    lower.includes("inbound") ||
    lower.includes("situation") ||
    lower.includes("scrimmage") ||
    lower.includes("slob") ||
    lower.includes("blob")
  ) {
    return "situational";
  }
  return null;
}

/**
 * Auto-build placeholder copy — must match `buildPracticeSegments` in `lib/practice-auto-build.ts`.
 * Exact equality only (no substring matching).
 */
const AUTO_BUILD_PLACEHOLDER_SEGMENT_NAME = "Coach choice / teaching segment";
const AUTO_BUILD_PLACEHOLDER_NOTES =
  "Placeholder added because not enough matching active coach-owned drills were available.";

/** True only for rows emitted by auto-build when no saved drill matched (drillId stays null). */
function isPlanningPlaceholder(entry: PracticeEntry): boolean {
  if (entry.drillId) {
    return false;
  }
  return (
    entry.segmentName === AUTO_BUILD_PLACEHOLDER_SEGMENT_NAME ||
    entry.notes === AUTO_BUILD_PLACEHOLDER_NOTES
  );
}

function describeTimeVsGoal(minutes: number, goal: number): string {
  if (goal <= 0) {
    return "";
  }
  const diff = minutes - goal;
  if (diff === 0) {
    return "Matches your goal";
  }
  if (diff < 0) {
    return `${Math.abs(diff)} min under your goal`;
  }
  return `${diff} min over your goal`;
}

function buildPracticeText(
  practiceDate: string,
  practiceType: string,
  targetDuration: number,
  plannedDuration: number,
  focusNotes: string,
  notes: string,
  blocks: PracticeBlock[],
  drillMap: Map<string, DrillOption>,
) {
  const lines = [
    `Date: ${practiceDate}`,
    `Practice emphasis: ${practiceType}`,
    `Goal length: ${targetDuration} min`,
    `Activities total: ${plannedDuration} min`,
  ];

  if (focusNotes.trim()) {
    lines.push(`Focus: ${focusNotes.trim()}`);
  }

  if (notes.trim()) {
    lines.push(`Notes: ${notes.trim()}`);
  }

  lines.push("");
  lines.push("Blocks:");

  blocks.forEach((block) => {
    lines.push(
      `- ${formatMinuteRange(block.startMinute, block.plannedDurationMinutes)} ${block.blockName} (${block.plannedDurationMinutes} min)`,
    );

    if (block.entries.length === 0) {
      lines.push("  - No entries yet");
      return;
    }

    block.entries.forEach((entry) => {
      const drill = entry.drillId ? drillMap.get(entry.drillId) : null;
      const isPh = isPlanningPlaceholder(entry);
      const entryName = isPh
        ? entry.segmentName.trim() || "Open planning slot"
        : entry.segmentName.trim() || drill?.name || entry.drillName || "Activity";
      const tag = isPh ? " (planning placeholder — not a saved drill yet)" : "";
      lines.push(`  - ${entryName} (${entry.durationMinutes} min)${tag}`);
      if (entry.notes.trim() && !isPh) {
        lines.push(`    ${entry.notes.trim()}`);
      }
    });
  });

  return lines.join("\n");
}

export function PracticeEditor({
  practiceId,
  practiceDate: initialPracticeDate,
  practiceType: initialPracticeType,
  targetDuration: initialTargetDuration,
  focusNotes: initialFocusNotes,
  notes: initialNotes,
  blocks: initialBlocks,
  availableDrills,
  templateOptions,
  saveAction,
  duplicateAction,
  swapDrillAction,
  sportKey,
  error,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [practiceDate, setPracticeDate] = useState(initialPracticeDate);
  const [practiceType, setPracticeType] = useState(initialPracticeType);
  const [targetDuration, setTargetDuration] = useState(String(initialTargetDuration));
  const [focusNotes, setFocusNotes] = useState(initialFocusNotes);
  const [notes, setNotes] = useState(initialNotes);
  const [blocks, setBlocks] = useState<PracticeBlock[]>(initialBlocks);
  const drillMap = useMemo(
    () => new Map(availableDrills.map((drill) => [drill.id, drill])),
    [availableDrills],
  );

  // Drill picker state — opens when the coach taps "Change drill" on any segment.
  const [pickerContext, setPickerContext] = useState<{
    segmentId: string;
    currentDrillId: string | null;
    blockName: string;
    blockZone: string | null;
  } | null>(null);
  const [, startSwap] = useTransition();

  const drillSheetOptions: DrillSheetOption[] = useMemo(
    () =>
      availableDrills.map((drill) => ({
        id: drill.id,
        name: drill.name,
        drill_type: drill.drill_type,
        default_duration_minutes: drill.default_duration_minutes,
        placement_zone: drill.placement_zone ?? null,
      })),
    [availableDrills],
  );

  function handlePickDrill(drillId: string) {
    if (!pickerContext || !swapDrillAction) return;

    const fd = new FormData();
    fd.set("practice_id", practiceId);
    fd.set("practice_block_drill_id", pickerContext.segmentId);
    fd.set("drill_id", drillId);

    startSwap(() => {
      swapDrillAction(fd);
    });
  }

  function quickAddBlock(option: { blockName: string; zone: string }) {
    const nextStart = blocks.reduce(
      (max, block) => Math.max(max, block.startMinute + block.plannedDurationMinutes),
      0,
    );
    const nextBlock: PracticeBlock = {
      blockName: option.blockName,
      startMinute: nextStart,
      itemType: "focus_anchor",
      plannedDurationMinutes: 10,
      templateId: null,
      entries: [{ ...createEmptyEntry(), segmentName: option.blockName, durationMinutes: 10 }],
    };

    setBlocks((current) => [...current, nextBlock]);
    setIsEditing(true);
  }

  const blockTotal = useMemo(
    () => blocks.reduce((sum, block) => sum + Number(block.plannedDurationMinutes || 0), 0),
    [blocks],
  );

  const entryTotal = useMemo(
    () =>
      blocks.reduce(
        (sum, block) =>
          sum +
          block.entries.reduce(
            (entrySum, entry) => entrySum + Number(entry.durationMinutes || 0),
            0,
          ),
        0,
      ),
    [blocks],
  );

  const targetValue = Number(targetDuration || 0);
  const blockDelta = describeTimeVsGoal(blockTotal, targetValue);
  const entryDelta = describeTimeVsGoal(entryTotal, targetValue);
  const timeMatch =
    targetValue > 0 && blockTotal === targetValue && entryTotal === targetValue;

  const planPayload = JSON.stringify({
    practiceId,
    practiceDate,
    practiceType,
    targetDuration: targetValue,
    focusNotes,
    notes,
    blocks,
  });

  const copyText = async () => {
    await navigator.clipboard.writeText(
      buildPracticeText(
        practiceDate,
        practiceType,
        targetValue,
        entryTotal,
        focusNotes,
        notes,
        blocks,
        drillMap,
      ),
    );
  };

  return (
    <div className="editor-shell">
      <section className="card no-print">
        <div className="stack">
          <p className="eyebrow">Practice plan</p>
          <p className="muted">
            Review your times below. Turn on <strong>Edit practice</strong> to rename blocks, change minutes, add or remove drills,
            then use <strong>Save practice plan</strong> at the bottom.
          </p>
        </div>
        <div className="editor-toolbar">
          <button className="button-secondary" type="button" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? "Done editing (review below)" : "Edit practice"}
          </button>
          <button className="button-secondary" type="button" onClick={() => void copyText()}>
            Copy text
          </button>
          <button className="button-secondary" type="button" onClick={() => window.print()}>
            Print
          </button>
          <form action={duplicateAction}>
            <input type="hidden" name="practice_id" value={practiceId} />
            <button className="button-secondary" type="submit">
              Duplicate
            </button>
          </form>
        </div>
      </section>

      <section className="card">
        <h2>Time check</h2>
        <p className="muted">Your practice length goal compared to the block plan and the time in each part.</p>
        <div className="stat-grid">
          <article className="card stat">
            <h3>Goal length</h3>
            <p>{targetValue} min</p>
            <p className="muted">What you set for the whole practice.</p>
          </article>
          <article className="card stat">
            <h3>Time in blocks</h3>
            <p>{blockTotal} min</p>
            <p className={targetValue > 0 && blockTotal !== targetValue ? "warning" : "muted"}>
              {targetValue > 0 ? blockDelta : "Set a goal length to compare."}
            </p>
          </article>
          <article className="card stat">
            <h3>Time in activities</h3>
            <p>{entryTotal} min</p>
            <p className={targetValue > 0 && entryTotal !== targetValue ? "warning" : "muted"}>
              {targetValue > 0 ? entryDelta : "Set a goal length to compare."}
            </p>
          </article>
          <article className="card stat">
            <h3>Quick read</h3>
            <p className={timeMatch ? "success" : "warning"}>
              {timeMatch
                ? "Block plan and activities both match your goal."
                : targetValue <= 0
                  ? "Add a goal length in edit mode to see over/under."
                  : "Adjust block times, activities, or your goal so the numbers line up the way you want."}
            </p>
          </article>
        </div>
        <div className="time-check-grid no-print">
          <div>
            <strong>Target</strong> {targetValue} min · <strong>Blocks add up to</strong> {blockTotal} min ·{" "}
            <strong>Activities add up to</strong> {entryTotal} min
          </div>
        </div>
      </section>

      {isEditing ? (
        <form action={saveAction} className="editor-grid no-print">
          <input type="hidden" name="practice_id" value={practiceId} />
          <input type="hidden" name="plan_payload" value={planPayload} />

          <p className="coach-help no-print">
            <strong>Editing tips.</strong> Change each block&apos;s minutes or name. Under a block, pick a saved drill or leave it open.
            Use <strong>Add activity</strong> for another row, <strong>Remove this activity</strong> to drop one row,{" "}
            <strong>Remove block</strong> to drop a whole section. Scroll down and press <strong>Save practice plan</strong> when you&apos;re
            finished — printing and duplicate still work after saving.
          </p>

          <section className="editor-section">
            <h2>Practice settings</h2>
            <div className="editor-row three-col">
              <label className="label">
                Practice date
                <input
                  className="input"
                  type="date"
                  value={practiceDate}
                  onChange={(event) => setPracticeDate(event.target.value)}
                  required
                />
              </label>

              <label className="label">
                Practice type
                <select
                  className="select"
                  value={practiceType}
                  onChange={(event) => setPracticeType(event.target.value)}
                >
                  <option value="offense">Offense</option>
                  <option value="defense">Defense</option>
                  <option value="balanced">Balanced</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              <label className="label">
                Target duration
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={targetDuration}
                  onChange={(event) => setTargetDuration(event.target.value)}
                  required
                />
              </label>
            </div>

            <label className="label">
              Focus notes
              <textarea
                className="input"
                rows={3}
                value={focusNotes}
                onChange={(event) => setFocusNotes(event.target.value)}
              />
            </label>

            <label className="label">
              Notes
              <textarea
                className="input"
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </section>

          <section className="editor-section">
            <div className="editor-toolbar">
              <h2>Blocks and activities (order)</h2>
              <button
                className="button-secondary"
                type="button"
                onClick={() => setBlocks((current) => [...current, createEmptyBlock()])}
              >
                Add block
              </button>
              {(quickAddBySport[sportKey] ?? []).map((option) => (
                <button
                  className="button-secondary"
                  type="button"
                  key={option.label}
                  onClick={() => quickAddBlock(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {blocks.map((block, blockIndex) => (
              <div className="editor-block" key={`${block.blockName}-${blockIndex}`}>
                <p className="block-order-label">
                  Part {blockIndex + 1} of {blocks.length}
                </p>
                <div className="editor-row three-col">
                  <label className="label">
                    Start minute
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={block.startMinute}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item, index) =>
                            index === blockIndex
                              ? { ...item, startMinute: Number(event.target.value || 0) }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="label">
                    Block name
                    <input
                      className="input"
                      type="text"
                      value={block.blockName}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item, index) =>
                            index === blockIndex
                              ? { ...item, blockName: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>

                  <label className="label">
                    Block type
                    <select
                      className="select"
                      value={block.templateId ?? ""}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item, index) =>
                            index === blockIndex
                              ? { ...item, templateId: event.target.value || null }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="">No category</option>
                      {templateOptions.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.display_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="label">
                    Kind
                    <select
                      className="select"
                      value={block.itemType}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item, index) =>
                            index === blockIndex
                              ? {
                                  ...item,
                                  itemType: event.target.value as "warmup" | "focus_anchor" | "drill_gap",
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="warmup">Warmup</option>
                      <option value="focus_anchor">Focus anchor</option>
                      <option value="drill_gap">Drill gap</option>
                    </select>
                  </label>

                  <label className="label">
                    Minutes for this block
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={block.plannedDurationMinutes}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item, index) =>
                            index === blockIndex
                              ? {
                                  ...item,
                                  plannedDurationMinutes: Number(event.target.value || 0),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                </div>

                <div className="editor-toolbar">
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() =>
                      setBlocks((current) =>
                        current.map((item, index) =>
                          index === blockIndex
                            ? { ...item, entries: [...item.entries, createEmptyEntry()] }
                            : item,
                        ),
                      )
                    }
                  >
                    Add activity
                  </button>
                  <button
                    className="button-inline danger-link"
                    type="button"
                    onClick={() =>
                      setBlocks((current) => current.filter((_, index) => index !== blockIndex))
                    }
                  >
                    Remove block
                  </button>
                </div>

                <div className="list">
                  {block.entries.length === 0 ? (
                    <div className="muted-box">No activities in this block yet — use Add activity.</div>
                  ) : (
                    block.entries.map((entry, entryIndex) => (
                      <div
                        className={`editor-entry${isPlanningPlaceholder(entry) ? " plan-placeholder" : ""}`}
                        key={`${blockIndex}-${entryIndex}`}
                      >
                        {isPlanningPlaceholder(entry) ? (
                          <p className="coach-help">
                            <strong>Planning placeholder.</strong> No matching saved drill was available here yet. This is not a real
                            drill on your list — add a drill for this block from My Drills, or pick one below when you have it.
                          </p>
                        ) : null}
                        <div className="editor-row three-col">
                          <label className="label">
                            Saved drill
                            <select
                              className="select"
                              value={entry.drillId ?? ""}
                              onChange={(event) =>
                                setBlocks((current) =>
                                  current.map((item, index) =>
                                    index === blockIndex
                                      ? {
                                          ...item,
                                          entries: item.entries.map((innerEntry, innerIndex) =>
                                            innerIndex === entryIndex
                                              ? {
                                                  ...innerEntry,
                                                  drillId: event.target.value || null,
                                                }
                                              : innerEntry,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            >
                              <option value="">None yet — label only</option>
                              {availableDrills.map((drill) => (
                                <option key={drill.id} value={drill.id}>
                                  {drill.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="label">
                            What to call this part
                            <input
                              className="input"
                              type="text"
                              value={entry.segmentName}
                              onChange={(event) =>
                                setBlocks((current) =>
                                  current.map((item, index) =>
                                    index === blockIndex
                                      ? {
                                          ...item,
                                          entries: item.entries.map((innerEntry, innerIndex) =>
                                            innerIndex === entryIndex
                                              ? {
                                                  ...innerEntry,
                                                  segmentName: event.target.value,
                                                }
                                              : innerEntry,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </label>

                          <label className="label">
                            Minutes
                            <input
                              className="input"
                              type="number"
                              min="1"
                              value={entry.durationMinutes}
                              onChange={(event) =>
                                setBlocks((current) =>
                                  current.map((item, index) =>
                                    index === blockIndex
                                      ? {
                                          ...item,
                                          entries: item.entries.map((innerEntry, innerIndex) =>
                                            innerIndex === entryIndex
                                              ? {
                                                  ...innerEntry,
                                                  durationMinutes: Number(
                                                    event.target.value || 0,
                                                  ),
                                                }
                                              : innerEntry,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>

                        <label className="label">
                          Notes for coaches
                          <textarea
                            className="input"
                            rows={2}
                            value={entry.notes}
                            onChange={(event) =>
                              setBlocks((current) =>
                                current.map((item, index) =>
                                  index === blockIndex
                                    ? {
                                        ...item,
                                        entries: item.entries.map((innerEntry, innerIndex) =>
                                          innerIndex === entryIndex
                                            ? { ...innerEntry, notes: event.target.value }
                                            : innerEntry,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                        </label>

                        <button
                          className="button-inline danger-link"
                          type="button"
                          onClick={() =>
                            setBlocks((current) =>
                              current.map((item, index) =>
                                index === blockIndex
                                  ? {
                                      ...item,
                                      entries: item.entries.filter(
                                        (_, innerIndex) => innerIndex !== entryIndex,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                        >
                          Remove this activity
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </section>

          {error ? <p className="error">{error}</p> : null}
          <button className="button" type="submit">
            Save practice plan
          </button>
        </form>
      ) : null}

      <section className="card">
        <h2>Practice plan (in order)</h2>
        <p className="muted">Same order you&apos;ll run on the floor — each part shows drills from your library or an open planning slot.</p>
        <div className="list">
          {blocks.map((block, blockIndex) => (
            <article className="list-card" key={`${block.blockName}-${blockIndex}`}>
              <div className="list-card-header">
                <div className="stack">
                  <span className="block-order-label">
                    Part {blockIndex + 1} of {blocks.length}
                  </span>
                  <h3>{block.blockName}</h3>
                </div>
                <div className="inline-meta">
                  <span className="chip">{formatMinuteRange(block.startMinute, block.plannedDurationMinutes)}</span>
                  <span className="chip">{block.plannedDurationMinutes} min</span>
                  <span className="chip">{block.itemType.replace("_", " ")}</span>
                </div>
              </div>

              <div className="list">
                {block.entries.length === 0 ? (
                  <div className="muted-box">Nothing scheduled in this block yet.</div>
                ) : (
                  block.entries.map((entry, entryIndex) => {
                    const drill = entry.drillId ? drillMap.get(entry.drillId) : null;
                    const isPh = isPlanningPlaceholder(entry);
                    const name = isPh
                      ? entry.segmentName.trim() || "Open slot"
                      : entry.segmentName.trim() || drill?.name || entry.drillName || "Activity";

                    const canSwap = Boolean(swapDrillAction && entry.id);

                    return (
                      <div
                        className={`list-card${isPh ? " plan-placeholder" : ""}`}
                        key={entry.id ?? `${blockIndex}-${entryIndex}`}
                      >
                        <div className="list-card-header">
                          <div className="stack">
                            <h3>{name}</h3>
                            {isPh ? (
                              <ul className="coach-tip-list">
                                <li>No matching saved drill yet — this is a planning placeholder, not something from your drill library.</li>
                                <li>Tap <strong>Add drill</strong> below to pick one from your library.</li>
                              </ul>
                            ) : null}
                          </div>
                          <div className="inline-meta">
                            <span className="chip">{entry.durationMinutes} min</span>
                            {isPh ? (
                              <span className="plan-placeholder-badge">Open slot</span>
                            ) : drill?.drill_type ? (
                              <span className="chip">{drill.drill_type.replace("_", " ")}</span>
                            ) : (
                              <span className="chip accent">Labeled only</span>
                            )}
                          </div>
                        </div>
                        {!isPh && entry.notes.trim() ? <p>{entry.notes.trim()}</p> : null}
                        {canSwap ? (
                          <div className="actions-row no-print">
                            <button
                              type="button"
                              className="button-inline"
                              onClick={() =>
                                setPickerContext({
                                  segmentId: entry.id as string,
                                  currentDrillId: entry.drillId,
                                  blockName: block.blockName,
                                  blockZone: inferBlockZone(block.blockName),
                                })
                              }
                            >
                              {entry.drillId ? "Change drill" : "Add drill"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <DrillPickerSheet
        open={pickerContext !== null}
        onClose={() => setPickerContext(null)}
        onPick={handlePickDrill}
        drills={drillSheetOptions}
        currentDrillId={pickerContext?.currentDrillId ?? null}
        defaultZoneFilter={pickerContext?.blockZone ?? null}
        title={pickerContext ? `Change drill — ${pickerContext.blockName}` : "Change drill"}
        emptyState={
          <p className="muted">
            No drills in your library match this filter. Open All to browse everything, or add a drill from My Drills.
          </p>
        }
      />
    </div>
  );
}
