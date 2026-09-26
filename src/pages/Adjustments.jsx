import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdjustment,
  getAdjustmentOptions,
  getAdjustments,
  getStockAtLocation,
  updateAdjustmentStatus,
  validateAdjustment,
} from "../services/adjustments";

const emptyForm = {
  adjustmentNumber: "",
  productId: "",
  warehouseId: "",
  locationId: "",
  systemQuantity: "0",
  countedQuantity: "",
  reason: "",
};

const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  waiting: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  canceled: "bg-red-100 text-red-700",
};

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [rows, options] = await Promise.all([
        getAdjustments(),
        getAdjustmentOptions(),
      ]);
      setAdjustments(rows);
      setWarehouses(options.warehouses);
      setLocations(options.locations);
      setProducts(options.products);
    } catch (loadError) {
      setError(loadError.message || "Failed to load adjustments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!form.productId || !form.locationId) return;
    let active = true;
    getStockAtLocation(form.productId, form.locationId)
      .then((quantity) => {
        if (active)
          setForm((current) => ({
            ...current,
            systemQuantity: String(quantity),
          }));
      })
      .catch((loadError) => {
        if (active)
          setError(loadError.message || "Failed to load location stock.");
      });
    return () => {
      active = false;
    };
  }, [form.productId, form.locationId]);

  const filteredAdjustments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return adjustments.filter(
      (adjustment) =>
        !query ||
        adjustment.adjustment_number?.toLowerCase().includes(query) ||
        adjustment.products?.name?.toLowerCase().includes(query) ||
        adjustment.products?.sku?.toLowerCase().includes(query),
    );
  }, [adjustments, search]);

  const difference =
    Number(form.countedQuantity || 0) - Number(form.systemQuantity || 0);

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "warehouseId" ? { locationId: "" } : {}),
      ...(name === "productId" || name === "locationId"
        ? { systemQuantity: "0" }
        : {}),
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (Number(form.countedQuantity) < 0) {
      setError("Counted quantity cannot be negative.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await createAdjustment({
        ...form,
        adjustmentNumber: form.adjustmentNumber.trim(),
        systemQuantity: Number(form.systemQuantity),
        countedQuantity: Number(form.countedQuantity),
        reason: form.reason.trim(),
      });
      setShowForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (saveError) {
      setError(saveError.message || "Failed to create adjustment.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      setActionId(id);
      setError("");
      await updateAdjustmentStatus(id, status);
      await loadData();
    } catch (statusError) {
      setError(statusError.message || "Failed to update adjustment.");
    } finally {
      setActionId(null);
    }
  };

  const handleValidate = async (id) => {
    try {
      setActionId(id);
      setError("");
      await validateAdjustment(id);
      await loadData();
    } catch (validationError) {
      setError(validationError.message || "Adjustment validation failed.");
    } finally {
      setActionId(null);
    }
  };

  const actionFor = (adjustment) => {
    const busy = actionId === adjustment.id;
    const buttonClass =
      "rounded-md px-3 py-2 text-sm font-semibold text-white disabled:opacity-50";
    if (adjustment.status === "draft")
      return (
        <button
          disabled={busy}
          onClick={() => handleStatus(adjustment.id, "waiting")}
          className={`${buttonClass} bg-amber-600`}
        >
          Send
        </button>
      );
    if (adjustment.status === "waiting")
      return (
        <button
          disabled={busy}
          onClick={() => handleStatus(adjustment.id, "ready")}
          className={`${buttonClass} bg-blue-600`}
        >
          Ready
        </button>
      );
    if (adjustment.status === "ready")
      return (
        <button
          disabled={busy}
          onClick={() => handleValidate(adjustment.id)}
          className={`${buttonClass} bg-emerald-600`}
        >
          {busy ? "Validating..." : "Validate"}
        </button>
      );
    return <span className="text-sm text-slate-500">No action</span>;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory Adjustments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Record physical counts and reconcile stock.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Adjustment
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Summary title="Total Adjustments" value={adjustments.length} />
        <Summary
          title="Awaiting Validation"
          value={
            adjustments.filter((item) =>
              ["waiting", "ready"].includes(item.status),
            ).length
          }
        />
        <Summary
          title="Validated"
          value={adjustments.filter((item) => item.status === "done").length}
        />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search adjustment, product or SKU..."
          className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 sm:max-w-md"
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Warehouse / Location</th>
              <th className="px-4 py-3 text-right">System</th>
              <th className="px-4 py-3 text-right">Counted</th>
              <th className="px-4 py-3 text-right">Difference</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading adjustments...
                </td>
              </tr>
            ) : filteredAdjustments.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No adjustments found.
                </td>
              </tr>
            ) : (
              filteredAdjustments.map((adjustment) => (
                <tr key={adjustment.id}>
                  <td className="px-4 py-3 font-semibold">
                    {adjustment.adjustment_number}
                  </td>
                  <td className="px-4 py-3">
                    {adjustment.products?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {adjustment.warehouses?.name || "-"} /{" "}
                    {adjustment.locations?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {adjustment.system_quantity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {adjustment.counted_quantity}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${Number(adjustment.difference_quantity) < 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {Number(adjustment.difference_quantity) > 0 ? "+" : ""}
                    {adjustment.difference_quantity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[adjustment.status] || statusStyles.draft}`}
                    >
                      {adjustment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{actionFor(adjustment)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={handleCreate}
            className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-md bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Adjustment</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="text-slate-500"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Adjustment Number">
                <input
                  name="adjustmentNumber"
                  value={form.adjustmentNumber}
                  onChange={changeForm}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Product">
                <select
                  name="productId"
                  value={form.productId}
                  onChange={changeForm}
                  required
                  className={inputClass}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Warehouse">
                <select
                  name="warehouseId"
                  value={form.warehouseId}
                  onChange={changeForm}
                  required
                  className={inputClass}
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location">
                <select
                  name="locationId"
                  value={form.locationId}
                  onChange={changeForm}
                  required
                  disabled={!form.warehouseId}
                  className={inputClass}
                >
                  <option value="">Select location</option>
                  {locations
                    .filter(
                      (location) => location.warehouse_id === form.warehouseId,
                    )
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="System Quantity">
                <input
                  type="number"
                  value={form.systemQuantity}
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                />
              </Field>
              <Field label="Physical Count">
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  name="countedQuantity"
                  value={form.countedQuantity}
                  onChange={changeForm}
                  required
                  className={inputClass}
                />
              </Field>
            </div>
            <p className="text-sm text-slate-600">
              Difference:{" "}
              <strong
                className={difference < 0 ? "text-red-600" : "text-emerald-600"}
              >
                {difference > 0 ? "+" : ""}
                {difference}
              </strong>
            </p>
            <Field label="Reason">
              <textarea
                name="reason"
                value={form.reason}
                onChange={changeForm}
                rows="2"
                className={inputClass}
              />
            </Field>
            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Create Draft"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Summary({ title, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100";
