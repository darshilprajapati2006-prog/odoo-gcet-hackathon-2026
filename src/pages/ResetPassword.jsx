import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await updatePassword(password);
      setUpdated(true);
    } catch (updateError) {
      setError(
        updateError.message ||
          "Unable to update password. Request a new reset link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white">StockSense</h1>
        <h2 className="mt-6 text-xl font-semibold text-white">
          Choose a new password
        </h2>
        {updated ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-emerald-300">
              Your password has been updated.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue to StockSense
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength="6"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-blue-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength="6"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-blue-500"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
            <p className="mt-5 text-sm text-slate-400">
              Reset link expired?{" "}
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300"
              >
                Request another
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
