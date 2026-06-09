"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { PLACEMENT_ZONES, PLACEMENT_ZONE_BUTTON_LABELS } from "@/lib/drill-goal-model";

type TagOption = {
  id: string;
  tag_name: string;
  tag_slug: string;
  category: string | null;
};

export type DrillEditInitial = {
  drillId: string;
  name: string;
  goalTagId: string;
  placementZone: string;
  drillType: string;
  durationMinutes: number;
  frequency: string;
  priorityHigh: boolean;
  additionalTagIds: string[];
  notes: string;
};

type Props = {
  tags: TagOption[];
  action: (formData: FormData) => void;
  success?: string;
  error?: string;
  edit?: DrillEditInitial;
  resetToken?: string;
};

/** How many skill chips show before the "Show all skills" reveal. */
const VISIBLE_SKILL_COUNT = 10;

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Saving…" : isEdit ? "Save changes" : "Save drill"}
    </button>
  );
}

export function DrillForm({ tags, action, success, error, edit, resetToken }: Props) {
  // Skills = the sport's concrete skill tags (footwork, shooting, conditioning, communication…).
  // These are the `sport_specific` tags — the abstract universal scheduling tags are not chips.
  const skillTags = useMemo(() => {
    return tags
      .filter((tag) => tag.category === "sport_specific")
      .sort((left, right) => left.tag_name.localeCompare(right.tag_name));
  }, [tags]);

  const visibleSkills = skillTags.slice(0, VISIBLE_SKILL_COUNT);
  const hiddenSkills = skillTags.slice(VISIBLE_SKILL_COUNT);

  const isEdit = Boolean(edit);
  const formKey = edit ? `edit-${edit.drillId}` : `create-${resetToken ?? "idle"}`;

  // If an edited drill has a selected skill that lives in the hidden group, open the reveal so the
  // coach can see all their selections at a glance.
  const editHasHiddenSkill = Boolean(
    edit && hiddenSkills.some((tag) => edit.additionalTagIds.includes(tag.id)),
  );
  const [showAllSkills, setShowAllSkills] = useState(editHasHiddenSkill);

  const hasOptionalDetails = Boolean(
    edit &&
      (edit.frequency !== "none" ||
        edit.priorityHigh ||
        edit.notes.trim().length > 0 ||
        (edit.drillType && edit.drillType !== "team")),
  );

  function renderSkillChip(tag: TagOption) {
    return (
      <label className="drill-chip" key={tag.id}>
        <input
          type="checkbox"
          name="tag_ids"
          value={tag.id}
          defaultChecked={edit ? edit.additionalTagIds.includes(tag.id) : false}
        />
        <span>{tag.tag_name}</span>
      </label>
    );
  }

  return (
    <>
      <form key={formKey} action={action} className="form-grid drill-form">
        {edit ? <input type="hidden" name="drill_id" value={edit.drillId} /> : null}

        <label className="label">
          Drill name
          <input
            className="input"
            type="text"
            name="name"
            placeholder="e.g. Shell closeout to rebound"
            required
            autoComplete="off"
            defaultValue={edit ? edit.name : undefined}
          />
        </label>

        <fieldset className="drill-zone-group">
          <legend className="label">When does it belong?</legend>
          <div className="drill-zone-buttons">
            {PLACEMENT_ZONES.map((zone) => (
              <label className="drill-zone-button" key={zone}>
                <input
                  type="radio"
                  name="placement_zone"
                  value={zone}
                  required
                  defaultChecked={edit ? (edit.placementZone || "general") === zone : false}
                />
                <span>{PLACEMENT_ZONE_BUTTON_LABELS[zone]}</span>
              </label>
            ))}
          </div>
          <p className="muted drill-form-hint">
            Pick where this drill fits. <strong>Situations</strong> covers inbounds, special
            situations, and free throws. <strong>Anytime</strong> can fill any open gap.
          </p>
        </fieldset>

        <div className="drill-skill-block">
          <p className="label">Skills it works on</p>
          <p className="muted drill-form-hint">Tap any that apply — keeps the planner&apos;s skill mix varied.</p>
          <div className="drill-chip-cloud">
            {visibleSkills.map(renderSkillChip)}
            {showAllSkills ? hiddenSkills.map(renderSkillChip) : null}
          </div>
          {hiddenSkills.length > 0 ? (
            <button
              type="button"
              className="drill-chip-more"
              onClick={() => setShowAllSkills((value) => !value)}
            >
              {showAllSkills ? "Show fewer skills" : `Show all skills (${hiddenSkills.length} more)`}
            </button>
          ) : null}
        </div>

        <label className="label">
          How long does it usually take?
          <div className="drill-form-duration">
            <input
              className="input"
              type="number"
              name="default_duration_minutes"
              min="1"
              inputMode="numeric"
              defaultValue={edit ? String(edit.durationMinutes) : "10"}
              required
            />
            <span className="drill-form-duration-unit">minutes</span>
          </div>
        </label>

        <details className="drill-form-more" open={hasOptionalDetails}>
          <summary>More (optional)</summary>

          <div className="drill-form-more-body">
            <label className="label">
              Drill format
              <select className="select" name="drill_type" defaultValue={edit ? edit.drillType : "team"}>
                <option value="team">Team</option>
                <option value="small_group">Small group</option>
                <option value="individual">Individual</option>
                <option value="competitive">Competitive</option>
              </select>
            </label>

            <label className="label">
              How often should it come up?
              <select className="select" name="frequency" defaultValue={edit ? edit.frequency : "none"}>
                <option value="none">No set frequency</option>
                <option value="every_practice">Every practice</option>
                <option value="weekly_1">About 1× per week</option>
                <option value="weekly_2">About 2× per week</option>
                <option value="weekly_3">About 3× per week</option>
              </select>
            </label>

            <label className="checkbox-item">
              <input type="checkbox" name="priority" defaultChecked={edit ? edit.priorityHigh : false} />
              <span>
                <strong>Priority drill</strong>
                <br />
                <span className="muted">The planner reaches for this one first when it fits.</span>
              </span>
            </label>

            <label className="label">
              Notes
              <textarea
                className="input"
                name="notes"
                rows={4}
                placeholder="Optional coaching cue or reminder."
                defaultValue={edit ? edit.notes : undefined}
              />
            </label>
          </div>
        </details>

        <SubmitButton isEdit={isEdit} />
      </form>

      {success ? <p className="success">{success}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </>
  );
}
