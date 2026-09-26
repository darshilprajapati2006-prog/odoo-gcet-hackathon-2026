import { Menu, Bell, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const pageNames = {
  dashboard: "Inventory overview",
  products: "Product catalog",
  receipts: "Incoming receipts",
  deliveries: "Delivery orders",
  transfers: "Internal transfers",
  adjustments: "Stock adjustments",
  "move-history": "Movement ledger",
  warehouses: "Warehouse network",
  profile: "Account profile",
};

function Navbar({ onMenuClick }) {
  const { profile, user } = useAuth();
  const location = useLocation();
  const pageName =
    pageNames[location.pathname.slice(1)] || "Inventory workspace";

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="lg:hidden">
          <h1 className="font-bold tracking-tight text-slate-900">
            StockSense
          </h1>
        </div>

        <div className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            StockSense
          </p>
          <h2 className="text-sm font-semibold text-slate-800">{pageName}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell size={20} />
        </button>

        <Link
          to="/profile"
          aria-label={`Open profile for ${displayName}`}
          className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-slate-200 hover:bg-slate-50"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-blue-700">
            <UserCircle size={20} />
          </span>

          <div className="hidden text-left sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-slate-800">
              {displayName}
            </p>

            <p className="max-w-40 truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
