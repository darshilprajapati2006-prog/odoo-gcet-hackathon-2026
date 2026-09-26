import { useState } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";

function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await resetPassword(email);

      setSuccess("Password reset instructions have been sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
        <Mail size={20} />
      </span>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
          Account recovery
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter your account email and we’ll send a secure reset link.
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-semibold text-slate-700">
          Email address
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <LoaderCircle size={17} className="animate-spin" />}
          {loading ? "Sending link..." : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-700 hover:text-blue-900"
        >
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;
