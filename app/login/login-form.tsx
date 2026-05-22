import { sendMagicLink } from "@/app/login/actions";

export function LoginForm({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  return (
    <form action={sendMagicLink} className="form-grid">
      <label className="label">
        Work email
        <input
          className="input"
          type="email"
          name="email"
          placeholder="coach@example.com"
          required
        />
      </label>

      <button className="button" type="submit">
        Email me a sign-in link
      </button>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}
    </form>
  );
}
