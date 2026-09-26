import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

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
    <AuthLayout>
      <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
        <ShieldCheck size={20} />
      </span>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
          Secure your account
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Choose a new password
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use at least 6 characters for your new password.
        </p>
      </div>
      {updated ? (
        <div className="mt-5 space-y-4">
          <p
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            Your password has been updated.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex w-full justify-center rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Continue to StockSense
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              New password
              <span className="relative mt-2 block">
                <input
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  minLength="6"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((visible) => !visible)}
                  aria-label={
                    showPasswords ? "Hide passwords" : "Show passwords"
                  }
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 hover:text-slate-700"
                >
                  {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Confirm password
              <input
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                minLength="6"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {loading && <LoaderCircle size={17} className="animate-spin" />}
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
          <p className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            Reset link expired?{" "}
            <Link
              to="/forgot-password"
              className="font-semibold text-blue-700 hover:text-blue-900"
            >
              Request another
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
