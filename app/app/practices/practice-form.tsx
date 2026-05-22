"use client";

import { COPY, SMART_PLAN_HOW_IT_WORKS } from "@/lib/brand";
import { type FormEvent, useMemo, useState } from "react";
import type { getPracticeTemplatesForSport } from "@/lib/data";

const targetOptions = ["60", "75", "90", "120", "custom"] as const;

const practiceTypeOptions = [
  { value: "offense", label: "Offense-focused" },
  { value: "defense", label: "Defense-focused" },
  { value: "balanced", label: "Balanced" },
  { value: "custom", label: "Custom" },
] as const;

type Templates = Awaited<ReturnType<typeof getPracticeTemplatesForSport>>;
type Template = Templates[number];
type TemplateBlock = Template["practice_template_blocks"][number];

type Props = {
  action: (formData: FormData) => void;
  autoBuildAction: (formData: FormData) => void;
  aiGenerateAction: (formData: FormData) => void;
  error?: string;
  teamName: string;
  activeSeasonName?: string | null;
  templates: Templates;
  availableDrills: Array<{
    id: string;
    name: string;
    default_duration_minutes: number;
    placement_zone?: string | null;
  }>;
  isAiAvailable: boolean;
};

function blockStateKey(templateKey: string, blockKey: string) {
  return `${templateKey}:${blockKey}`;
}

function defaultBlockDuration(block: TemplateBlock) {
  return String(block.default_duration_minutes ?? "");
}

function isWarmupBlock(block: TemplateBlock) {
  return block.item_type === "warmup" || block.block_key === "warmup";
}

function clampDuration(value: number) {
  return Math.min(60, Math.max(5, value));
}

export function PracticeForm({
  action,
  autoBuildAction,
  aiGenerateAction,
  error,
  teamName,
  activeSeasonName,
  templates,
  availableDrills,
  isAiAvailable,
}: Props) {
  const [targetSelection, setTargetSelection] = useState<(typeof targetOptions)[number]>("90");
  const [customTarget, setCustomTarget] = useState("90");
  const [practiceType, setPracticeType] = useState<string>("balanced");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(templates[0]?.template_key ?? "");
  const [blockEnabled, setBlockEnabled] = useState<Record<string, boolean>>({});
  const [blockDuration, setBlockDuration] = useState<Record<string, string>>({});
  const [blockFocus, setBlockFocus] = useState<Record<string, string>>({});
  const [templateError, setTemplateError] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLockMessage, setAiLockMessage] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.template_key === selectedTemplateKey) ?? templates[0] ?? null,
    [selectedTemplateKey, templates],
  );

  const selectedBlocks = useMemo(
    () =>
      [...(selectedTemplate?.practice_template_blocks ?? [])].sort(
        (first, second) => first.block_order - second.block_order,
      ),
    [selectedTemplate],
  );

  const warmupBlock = selectedBlocks.find(isWarmupBlock);

  const targetMinutes = useMemo(() => {
    if (targetSelection === "custom") {
      const parsed = Number(customTarget);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return Number(targetSelection);
  }, [customTarget, targetSelection]);

  const getBlockEnabled = (block: TemplateBlock) => {
    if (!block.is_optional) {
      return true;
    }

    const stateKey = blockStateKey(selectedTemplate?.template_key ?? "", block.block_key);
    return blockEnabled[stateKey] ?? false;
  };

  const getBlockDuration = (block: TemplateBlock) => {
    const stateKey = blockStateKey(selectedTemplate?.template_key ?? "", block.block_key);
    return blockDuration[stateKey] ?? defaultBlockDuration(block);
  };

  const getBlockFocus = (block: TemplateBlock) => {
    const stateKey = blockStateKey(selectedTemplate?.template_key ?? "", block.block_key);
    return blockFocus[stateKey] ?? "";
  };

  const plannedMinutes = useMemo(() => {
    return selectedBlocks.reduce((sum, block) => {
      if (!getBlockEnabled(block)) {
        return sum;
      }

      const parsed = Number(getBlockDuration(block));
      return Number.isFinite(parsed) ? sum + parsed : sum;
    }, 0);
  }, [blockDuration, blockEnabled, selectedBlocks, selectedTemplate]);

  const legacyWarmupMinutes = warmupBlock ? getBlockDuration(warmupBlock) : "10";

  function updateBlockDuration(stateKey: string, nextValue: string) {
    setBlockDuration((current) => ({ ...current, [stateKey]: nextValue }));
    setTemplateError("");
  }

  function stepBlockDuration(stateKey: string, currentValue: string, direction: -1 | 1) {
    const parsed = Number(currentValue);
    const current = Number.isFinite(parsed) ? parsed : 5;
    updateBlockDuration(stateKey, String(clampDuration(current + direction * 5)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selectedTemplate) {
      event.preventDefault();
      setTemplateError("Choose a practice template before saving.");
      return;
    }

    for (const block of selectedBlocks) {
      if (!getBlockEnabled(block)) {
        continue;
      }

      const duration = Number(getBlockDuration(block));
      if (!Number.isFinite(duration) || !Number.isInteger(duration) || duration <= 0) {
        event.preventDefault();
        setTemplateError(`Duration for ${block.block_name} must be a positive whole number.`);
        return;
      }
    }

    const warmup = Number(legacyWarmupMinutes);
    if (!Number.isFinite(warmup) || warmup < 5 || warmup > 15) {
      event.preventDefault();
      setTemplateError("Warmup must be between 5 and 15 minutes.");
      return;
    }

    setTemplateError("");
  }

  return (
    <form action={action} className="pf-form" onSubmit={handleSubmit}>
      <div className="muted-box pf-meta">
        Team: {teamName}
        <br />
        Active season: {activeSeasonName ?? "No active season linked"}
      </div>

      <p className="coach-help pf-help">
        <strong>Pick a template, set durations, and we'll build the practice around your blocks.</strong>
      </p>

      <section className={`ai-generate-panel${isAiAvailable ? "" : " locked"}`}>
        <div className="stack">
          <p className="eyebrow">{COPY.smartPlanEyebrow}</p>
          <h3>{COPY.smartPlanTitle}</h3>
          <p className="muted">{COPY.smartPlanLede}</p>
          <p className="muted" style={{ fontSize: "0.88rem" }}>
            {SMART_PLAN_HOW_IT_WORKS}
          </p>
        </div>
        <button
          className={isAiAvailable ? "button ai-generate-button" : "button-secondary ai-generate-button"}
          type="button"
          onClick={() => {
            if (!isAiAvailable) {
              setAiLockMessage(COPY.smartPlanProRequired);
              return;
            }
            setAiLockMessage("");
            setAiModalOpen(true);
          }}
          aria-disabled={!isAiAvailable}
        >
          {isAiAvailable ? COPY.smartPlanButton : COPY.smartPlanButtonPro}
        </button>
        {aiLockMessage ? (
          <p className="error">
            {aiLockMessage} {COPY.smartPlanProHelp}
          </p>
        ) : null}
      </section>

      <div className="pf-field-grid">
        <label className="label pf-field">
          Practice template
          <select
            className="select pf-control"
            name="practice_template_key"
            value={selectedTemplate?.template_key ?? ""}
            onChange={(event) => {
              setSelectedTemplateKey(event.target.value);
              setTemplateError("");
            }}
            disabled={templates.length === 0}
            required
          >
            {templates.length === 0 ? <option value="">No templates available</option> : null}
            {templates.map((template) => (
              <option key={template.id} value={template.template_key}>
                {template.display_name}
              </option>
            ))}
          </select>
        </label>

        <label className="label pf-field">
          Practice date
          <input className="input pf-control" type="date" name="practice_date" required />
        </label>

        <label className="label pf-field">
          Total practice length
          <select
            className="select pf-control"
            value={targetSelection}
            onChange={(event) => setTargetSelection(event.target.value as (typeof targetOptions)[number])}
          >
            <option value="60">60 minutes</option>
            <option value="75">75 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
            <option value="custom">Custom length...</option>
          </select>
        </label>

        {targetSelection === "custom" ? (
          <label className="label pf-field">
            Custom length (minutes)
            <input
              className="input pf-control"
              type="number"
              min="1"
              value={customTarget}
              onChange={(event) => setCustomTarget(event.target.value)}
              required
            />
          </label>
        ) : null}

        <label className="label pf-field">
          Practice type
          <select className="select pf-control" name="practice_type" value={practiceType} onChange={(event) => setPracticeType(event.target.value)}>
            {practiceTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input
        type="hidden"
        name="target_duration_minutes"
        value={targetSelection === "custom" ? customTarget : targetSelection}
      />

      <input type="hidden" name="warmup_duration_minutes" value={legacyWarmupMinutes} />

      <label className="label pf-field">
        Focus notes
        <textarea className="input pf-control" name="focus_notes" rows={3} placeholder="Optional focus for this session." />
      </label>

      <label className="label pf-field">
        Notes
        <textarea className="input pf-control" name="notes" rows={4} placeholder="Optional practice context or reminders." />
      </label>

      <div className="pf-block-section">
        <div className="pf-section-heading">
          <h3>Template blocks</h3>
          <p className="muted">Set durations for the blocks in this template. Optional blocks start unchecked.</p>
        </div>
        {selectedBlocks.length === 0 ? (
          <div className="muted-box">No blocks are configured for this template yet.</div>
        ) : (
          <div className="pf-block-grid">
            {selectedBlocks.map((block) => {
              const stateKey = blockStateKey(selectedTemplate?.template_key ?? "", block.block_key);
              const enabled = getBlockEnabled(block);
              const duration = getBlockDuration(block);
              const focus = getBlockFocus(block);

              return (
                <section className="pf-block-card" key={block.id}>
                  <input type="hidden" name={`block_${block.block_key}_enabled`} value={enabled ? "on" : "off"} />
                  <input type="hidden" name={`block_${block.block_key}_duration_minutes`} value={duration} />
                  {block.allows_subcategory_focus ? (
                    <input type="hidden" name={`block_${block.block_key}_focus_subcategory`} value={focus} />
                  ) : null}

                  <div className="pf-block-header">
                    <h4>{block.block_name}</h4>
                    {block.is_optional ? (
                      <label className="pf-switch">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(event) => {
                            setBlockEnabled((current) => ({ ...current, [stateKey]: event.target.checked }));
                            setTemplateError("");
                          }}
                        />
                        <span className="pf-switch-track" aria-hidden="true">
                          <span className="pf-switch-thumb" />
                        </span>
                        <span className="sr-only">Include {block.block_name}</span>
                      </label>
                    ) : null}
                  </div>

                  <label className="label pf-block-field">
                    Duration minutes
                    <div className="pf-stepper">
                      <button
                        className="pf-stepper-button"
                        type="button"
                        onClick={() => stepBlockDuration(stateKey, duration, -1)}
                        disabled={!enabled || Number(duration) <= 5}
                        aria-label={`Decrease ${block.block_name} duration`}
                      >
                        -
                      </button>
                      <input
                        className="input pf-stepper-input"
                        type="number"
                        min="5"
                        max="60"
                        step="5"
                        value={duration}
                        disabled={!enabled}
                        onChange={(event) => updateBlockDuration(stateKey, event.target.value)}
                        required={enabled}
                      />
                      <button
                        className="pf-stepper-button"
                        type="button"
                        onClick={() => stepBlockDuration(stateKey, duration, 1)}
                        disabled={!enabled || Number(duration) >= 60}
                        aria-label={`Increase ${block.block_name} duration`}
                      >
                        +
                      </button>
                    </div>
                  </label>

                  {block.allows_subcategory_focus ? (
                    <label className="label pf-block-field">
                      Focus on
                      <input
                        className="input pf-control"
                        type="text"
                        value={focus}
                        disabled={!enabled}
                        onChange={(event) => setBlockFocus((current) => ({ ...current, [stateKey]: event.target.value }))}
                        placeholder="Optional sub-focus, e.g. pick and roll"
                      />
                    </label>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {templateError ? <p className="error">{templateError}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="practice-summary muted-box pf-summary">
        <strong>Timeline summary</strong>
        <span>
          Target length: <strong>{targetMinutes} min</strong>
        </span>
        <span>
          Template minutes selected: <strong>{plannedMinutes} min</strong>
        </span>
        <span className="muted">Any leftover time becomes an Open practice flow block for the auto-builder to fill.</span>
      </div>

      <div className="actions-row pf-actions">
        <button className="button-secondary pf-submit" formAction={action} type="submit">
          Save outline only
        </button>
        <button className="button pf-submit" formAction={autoBuildAction} type="submit">
          Build practice from my drills
        </button>
      </div>

      {aiModalOpen ? (
        <div className="ai-modal-root">
          <button
            type="button"
            className="ai-modal-backdrop"
            aria-label={COPY.closeQuickPlan}
            onClick={() => setAiModalOpen(false)}
          />
          <section className="ai-modal" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
            <header className="ai-modal-header">
              <div>
                <p className="eyebrow">{COPY.smartPlanEyebrow}</p>
                <h3 id="ai-modal-title">What do you want to work on today?</h3>
              </div>
              <button className="button-inline" type="button" onClick={() => setAiModalOpen(false)}>
                Close
              </button>
            </header>

            <label className="label">
              Today&apos;s focus
              <textarea
                className="input"
                name="ai_prompt"
                rows={4}
                placeholder="Example: clean up late-game press break and get more competitive rebounding."
                required={aiModalOpen}
              />
            </label>

            <label className="label">
              Game stats or notes
              <textarea
                className="input"
                name="ai_manual_stats"
                rows={3}
                placeholder="Optional: turnovers, shots allowed, aces allowed, errors, or other game notes."
              />
            </label>

            <div className="ai-stats-grid">
              <label className="label">
                Stats CSV
                <input className="input" name="ai_stats_file" type="file" accept=".csv,text/csv,text/plain" />
              </label>

              <label className="label">
                Game date
                <input className="input" name="ai_stats_event_date" type="date" />
              </label>

              <label className="label">
                Opponent
                <input className="input" name="ai_stats_opponent" type="text" placeholder="Optional" />
              </label>
            </div>

            <div className="ai-include-drills">
              <h4>Drills to include</h4>
              <p className="muted">{COPY.optionalDrillHint}</p>
              <div className="ai-drill-checklist">
                {availableDrills.length === 0 ? (
                  <p className="muted">No active drills in your library yet.</p>
                ) : (
                  availableDrills.slice(0, 18).map((drill) => (
                    <label className="ai-drill-option" key={drill.id}>
                      <input type="checkbox" name="ai_include_drill_ids" value={drill.id} />
                      <span>
                        <strong>{drill.name}</strong>
                        <small>
                          {drill.default_duration_minutes} min
                          {drill.placement_zone ? ` · ${drill.placement_zone.replace("_", " ")}` : ""}
                        </small>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="muted-box ai-context">
              Template: <strong>{selectedTemplate?.display_name ?? "None selected"}</strong>
              <br />
              Target: <strong>{targetMinutes} min</strong>
              <br />
              Selected block minutes: <strong>{plannedMinutes} min</strong>
            </div>

            <div className="actions-row">
              <button className="button-secondary" type="button" onClick={() => setAiModalOpen(false)}>
                Cancel
              </button>
              <button className="button" formAction={aiGenerateAction} type="submit">
                Build plan
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </form>
  );
}
