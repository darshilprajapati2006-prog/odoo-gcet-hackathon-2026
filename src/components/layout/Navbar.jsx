import { Menu, Bell, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function Navbar({ onMenuClick }) {
  const { profile, user } = useAuth();

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="lg:hidden">
          <h1 className="font-bold text-white">StockSense</h1>
        </div>

        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-white">
            Inventory Dashboard
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
          <Bell size={20} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800"
        >
          <UserCircle size={28} className="text-slate-400" />

          <div className="hidden text-left sm:block">
            <p className="max-w-32 truncate text-sm font-medium text-white">
              {displayName}
            </p>

            <p className="max-w-32 truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
