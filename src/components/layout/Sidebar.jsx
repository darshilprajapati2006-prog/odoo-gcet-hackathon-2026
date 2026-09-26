import {
  BarChart3,
  Boxes,
  FileInput,
  FileOutput,
  History,
  Warehouse,
  ArrowLeftRight,
  ClipboardCheck,
  UserCircle,
  LogOut,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Products",
    path: "/products",
    icon: Boxes,
  },
  {
    label: "Receipts",
    path: "/receipts",
    icon: FileInput,
  },
  {
    label: "Deliveries",
    path: "/deliveries",
    icon: FileOutput,
  },
  {
    label: "Transfers",
    path: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    label: "Adjustments",
    path: "/adjustments",
    icon: ClipboardCheck,
  },
  {
    label: "Move History",
    path: "/move-history",
    icon: History,
  },
  {
    label: "Warehouses",
    path: "/warehouses",
    icon: Warehouse,
  },
];

function Sidebar({ open, onClose }) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div>
            <h1 className="text-xl font-bold text-white">StockSense</h1>
            <p className="text-xs text-slate-500">Inventory Management</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="my-5 border-t border-slate-800" />

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <UserCircle size={19} />
            <span>My Profile</span>
          </NavLink>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/40"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
