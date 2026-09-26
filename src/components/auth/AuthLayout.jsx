import { Boxes, Check, MoveRight } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <main className="auth-shell grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
      <aside className="auth-panel relative hidden min-h-screen overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255 / 6%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 6%) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <span className="brand-mark">
            <Boxes size={21} />
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight">StockSense</p>
            <p className="text-xs text-slate-400">Inventory workspace</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl py-14">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            <span className="h-px w-7 bg-blue-300/70" /> Operations, in balance
          </p>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
            Every movement has a place.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            Keep products, locations, and inventory activity connected in one
            clear workspace.
          </p>
          <div className="mt-10 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
              <Check size={18} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">A reliable stock record</p>
              <p className="mt-1 text-xs text-slate-400">
                Receipts, transfers, deliveries and counts
              </p>
            </div>
            <MoveRight size={18} className="text-slate-500" />
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          StockSense · Inventory management
        </p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
              <Boxes size={20} />
            </span>
            <div>
              <p className="font-bold tracking-tight text-slate-900">
                StockSense
              </p>
              <p className="text-xs text-slate-500">Inventory workspace</p>
            </div>
          </div>
          <div className="auth-card rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            Secure inventory access
          </p>
        </div>
      </section>
    </main>
  );
}
