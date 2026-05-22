import { createTeamAndSeason } from "@/app/app/actions";

type SportOption = {
  sport_key: string;
  display_name: string;
};

export function OnboardingForm({
  sports,
  error,
}: {
  sports: SportOption[];
  error?: string;
}) {
  return (
    <form action={createTeamAndSeason} className="form-grid">
      <label className="label">
        Team name
        <input
          className="input"
          type="text"
          name="team_name"
          placeholder="Varsity Girls Basketball"
          required
        />
      </label>

      <label className="label">
        Sport
        <select className="select" name="sport_key" required defaultValue="">
          <option value="" disabled>
            Select a sport
          </option>
          {sports.map((sport) => (
            <option key={sport.sport_key} value={sport.sport_key}>
              {sport.display_name}
            </option>
          ))}
        </select>
      </label>

      <label className="label">
        Season name
        <input
          className="input"
          type="text"
          name="season_name"
          placeholder="2026 Summer"
          required
        />
      </label>

      <button className="button" type="submit">
        Finish setup
      </button>

      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
