"use client";

import { useFormStatus } from "react-dom";
import { isMainPracticeGoalSlug, PLACEMENT_ZONES, PLACEMENT_ZONE_LABELS } from "@/lib/drill-goal-model";

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

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Saving..." : isEdit ? "Save changes" : "Save drill"}
    </button>
  );
}

export function DrillForm({ tags, action, success, error, edit, resetToken }: Props) {
  const goalTags = tags.filter((tag) => tag.category === "universal" && isMainPracticeGoalSlug(tag.tag_slug));
  const detailTags = tags.filter((tag) => !isMainPracticeGoalSlug(tag.tag_slug));

  const isEdit = Boolean(edit);
  const formKey = edit ? `edit-${edit.drillId}` : `create-${resetToken ?? "idle"}`;

  return (
    <>
      <form
        key={formKey}
        action={action}
        className="form-grid"
      >
        {edit ? <input type="hidden" name="drill_id" value={edit.drillId} /> : null}

        <label className="label">
          Drill name
          <input
            className="input"
            type="text"
            name="name"
            placeholder="Shell closeout to rebound"
            required
            defaultValue={edit ? edit.name : undefined}
          />
        </label>

        <label className="label">
          Where does this drill go in practice?
          <select
            className="select"
            name="placement_zone"
            required
            defaultValue={edit ? edit.placementZone || "general" : "general"}
          >
            {PLACEMENT_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {PLACEMENT_ZONE_LABELS[zone]}
              </option>
            ))}
          </select>
        </label>

        <p className="muted">
          This tells the planner which block to put this drill in. Offense and defense drills only
          go in their matching blocks (or open gaps). End-of-practice drills close the session — one per practice.
        </p>

        <label className="label">
          Practice goal (for tracking)
          <select
            className="select"
            name="goal_tag_id"
            required
            defaultValue={edit ? edit.goalTagId || "" : ""}
          >
            <option value="" disabled>
              Select the main goal for this drill
            </option>
            {goalTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.tag_name}
              </option>
            ))}
          </select>
        </label>

        <label className="label">
          Drill format
          <select
            className="select"
            name="drill_type"
            required
            defaultValue={edit ? edit.drillType : "team"}
          >
            <option value="individual">Individual</option>
            <option value="small_group">Small group</option>
            <option value="team">Team</option>
            <option value="warmup">Warmup</option>
            <option value="competitive">Competitive</option>
            <option value="scrimmage">Scrimmage</option>
            <option value="conditioning">Conditioning</option>
          </select>
        </label>

        <label className="label">
          Default duration (minutes)
          <input
            className="input"
            type="number"
            name="default_duration_minutes"
            min="1"
            defaultValue={edit ? String(edit.durationMinutes) : "10"}
            required
          />
        </label>

        <label className="label">
          Frequency
          <select className="select" name="frequency" defaultValue={edit ? edit.frequency : "none"}>
            <option value="none">None</option>
            <option value="every_practice">Every practice</option>
            <option value="weekly_1">Weekly 1</option>
            <option value="weekly_2">Weekly 2</option>
            <option value="weekly_3">Weekly 3</option>
          </select>
        </label>

        <label className="checkbox-item">
          <input type="checkbox" name="priority" defaultChecked={edit ? edit.priorityHigh : false} />
          <span>
            <strong>Priority</strong>
            <br />
            Mark this as a higher-priority drill in your personal library.
          </span>
        </label>

        <div className="stack">
          <label className="label">Additional tags</label>
          <p className="muted">
            Tag the specific skills this drill works on — shooting, footwork, conditioning, etc.
            The planner uses these to vary the skill mix within each block.
          </p>
          <div className="checkbox-grid">
            {detailTags.map((tag) => (
              <label className="checkbox-item" key={tag.id}>
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={edit ? edit.additionalTagIds.includes(tag.id) : false}
                />
                <span>
                  <strong>{tag.tag_name}</strong>
                  <br />
                  <span className="muted">{(tag.category ?? "general").replace("_", " ")}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <label className="label">
          Notes
          <textarea
            className="input"
            name="notes"
            rows={4}
            placeholder="Optional coaching reminder or drill cue."
            defaultValue={edit ? edit.notes : undefined}
          />
        </label>

        <SubmitButton isEdit={isEdit} />
      </form>

      {success ? <p className="success">{success}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </>
  );
}
