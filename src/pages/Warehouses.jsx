import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  RefreshCw,
  Search,
  Plus,
  Pencil,
  Power,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "../services/supabase";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
  });

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError("");

      const [warehousesResult, locationsResult] = await Promise.all([
        supabase
          .from("warehouses")
          .select("id, name, code, is_active")
          .order("name"),

        supabase
          .from("locations")
          .select("id, name, code, warehouse_id, is_active")
          .order("name"),
      ]);

      if (warehousesResult.error) {
        throw warehousesResult.error;
      }

      if (locationsResult.error) {
        throw locationsResult.error;
      }

      setWarehouses(warehousesResult.data || []);
      setLocations(locationsResult.data || []);
    } catch (err) {
      console.error("Warehouse loading error:", err);
      setError(err?.message || "Unable to load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const openAddModal = () => {
    setEditingWarehouse(null);
    setForm({
      name: "",
      code: "",
    });
    setShowModal(true);
  };

  const openEditModal = (warehouse) => {
    setEditingWarehouse(warehouse);
    setForm({
      name: warehouse.name || "",
      code: warehouse.code || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingWarehouse(null);
    setForm({
      name: "",
      code: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Warehouse name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Warehouse code is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      };

      if (editingWarehouse) {
        const { error: updateError } = await supabase
          .from("warehouses")
          .update(payload)
          .eq("id", editingWarehouse.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("warehouses")
          .insert(payload);

        if (insertError) throw insertError;
      }

      closeModal();
      await loadWarehouses();
    } catch (err) {
      console.error("Warehouse save error:", err);
      setError(err?.message || "Unable to save warehouse.");
    } finally {
      setSaving(false);
    }
  };

  const toggleWarehouseStatus = async (warehouse) => {
    try {
      setError("");

      const { error: updateError } = await supabase
        .from("warehouses")
        .update({
          is_active: !warehouse.is_active,
        })
        .eq("id", warehouse.id);

      if (updateError) throw updateError;

      await loadWarehouses();
    } catch (err) {
      console.error("Warehouse status error:", err);
      setError(err?.message || "Unable to update warehouse status.");
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      warehouse.name?.toLowerCase().includes(query) ||
      warehouse.code?.toLowerCase().includes(query)
    );
  });

  const getWarehouseLocations = (warehouseId) => {
    return locations.filter(
      (location) => location.warehouse_id === warehouseId,
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-medium text-slate-500">
            Loading warehouses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Inventory Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Warehouses
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage warehouses and their inventory locations.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadWarehouses}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div>
            <p className="font-semibold">Warehouse error</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Search + Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Warehouses</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {warehouses.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Warehouses
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {warehouses.filter((warehouse) => warehouse.is_active).length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Locations</p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {locations.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search warehouse by name or code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Warehouse Cards */}
      {filteredWarehouses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 size={42} className="mx-auto text-slate-300" />

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            No warehouses found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try another search."
              : "Create your first warehouse to get started."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add Warehouse
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredWarehouses.map((warehouse) => {
            const warehouseLocations = getWarehouseLocations(warehouse.id);

            return (
              <div
                key={warehouse.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Building2 size={24} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {warehouse.name}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Code: {warehouse.code || "-"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      warehouse.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {warehouse.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={17} className="text-slate-400" />

                      <span className="text-sm font-semibold text-slate-700">
                        Locations
                      </span>
                    </div>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {warehouseLocations.length}
                    </span>
                  </div>

                  {warehouseLocations.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {warehouseLocations.map((location) => (
                        <div
                          key={location.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {location.name}
                            </p>

                            {location.code && (
                              <p className="text-xs text-slate-500">
                                {location.code}
                              </p>
                            )}
                          </div>

                          <span
                            className={`text-xs font-semibold ${
                              location.is_active
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {location.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      No locations configured.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex gap-2 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => openEditModal(warehouse)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWarehouseStatus(warehouse)}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      warehouse.is_active
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    <Power size={15} />
                    {warehouse.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingWarehouse
                    ? "Update warehouse details."
                    : "Create a new warehouse."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Warehouse Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Main Warehouse"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Warehouse Code
                </label>

                <input
                  type="text"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="e.g. WH-MAIN"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingWarehouse
                      ? "Update Warehouse"
                      : "Create Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Warehouses;
