import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  Shield,
  CalendarDays,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../services/supabase";

function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!currentUser) {
        throw new Error("No authenticated user found.");
      }

      setUser(currentUser);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFullName(profileData?.full_name || "");
    } catch (err) {
      console.error("Profile loading error:", err);
      setError(err?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!user) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      setFullName(data.full_name || "");
      setEditing(false);
      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || "");
    setEditing(false);
    setError("");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";

    return role
      .toString()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={34} />

          <p className="text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Account Management
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your StockSense account information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Something went wrong</p>

            <p className="mt-1 text-sm">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 size={20} />

          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Profile Hero */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 text-blue-600 shadow-lg">
                <UserCircle size={58} />
              </div>

              <div className="pb-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {profile?.full_name || "StockSense User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditing(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your basic account information.
            </p>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <UserCircle
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={fullName}
                    disabled={!editing || saving}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none ${
                      editing
                        ? "border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        : "border-slate-100 bg-slate-50 text-slate-600"
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Email is managed by your authentication account.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>

                <div className="relative">
                  <Shield
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={getRoleLabel(profile?.role)}
                    disabled
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Role is controlled by the system.
                </p>
              </div>
            </div>

            {/* Save Buttons */}
            {editing && (
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Account Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Authentication and account details.
          </p>

          <div className="mt-6 space-y-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={20} />

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Account Role
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {getRoleLabel(profile?.role)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-blue-600" size={20} />

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Account Created
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDate(user?.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-600" size={20} />

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Login Email
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-slate-800">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User ID */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          User ID
        </p>

        <p className="mt-2 break-all font-mono text-sm text-slate-600">
          {user?.id || "—"}
        </p>
      </div>
    </div>
  );
}

export default Profile;
