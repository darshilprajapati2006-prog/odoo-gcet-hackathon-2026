import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTransfer,
  getTransferOptions,
  getTransfers,
  updateTransferStatus,
  validateTransfer,
} from "../services/transfers";

const emptyForm = {
  transferNumber: "",
  sourceWarehouseId: "",
  sourceLocationId: "",
  destinationWarehouseId: "",
  destinationLocationId: "",
  productId: "",
  quantity: "",
  scheduledDate: "",
  notes: "",
};

const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  waiting: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  canceled: "bg-red-100 text-red-700",
};

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
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
      const [transferRows, options] = await Promise.all([
        getTransfers(),
        getTransferOptions(),
      ]);
      setTransfers(transferRows);
      setWarehouses(options.warehouses);
      setLocations(options.locations);
      setProducts(options.products);
    } catch (loadError) {
      setError(loadError.message || "Failed to load transfers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransfers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transfers.filter((transfer) => {
      const item = transfer.transfer_items?.[0];
      return (
        !query ||
        transfer.transfer_number?.toLowerCase().includes(query) ||
        item?.products?.name?.toLowerCase().includes(query) ||
        item?.products?.sku?.toLowerCase().includes(query)
      );
    });
  }, [transfers, search]);

  const getWarehouseName = (id) =>
    warehouses.find((warehouse) => warehouse.id === id)?.name || "Unknown";
  const getLocationName = (id) =>
    locations.find((location) => location.id === id)?.name || "Unknown";

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "sourceWarehouseId" ? { sourceLocationId: "" } : {}),
      ...(name === "destinationWarehouseId"
        ? { destinationLocationId: "" }
        : {}),
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (form.sourceLocationId === form.destinationLocationId) {
      setError("Choose different source and destination locations.");
      return;
    }
    if (Number(form.quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await createTransfer({
        ...form,
        transferNumber: form.transferNumber.trim(),
        quantity: Number(form.quantity),
        notes: form.notes.trim() || null,
      });
      setShowForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (saveError) {
      setError(saveError.message || "Failed to create transfer.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (transferId, status) => {
    try {
      setActionId(transferId);
      setError("");
      await updateTransferStatus(transferId, status);
      await loadData();
    } catch (statusError) {
      setError(statusError.message || "Failed to update transfer.");
    } finally {
      setActionId(null);
    }
  };

  const handleValidate = async (transferId) => {
    try {
      setActionId(transferId);
      setError("");
      await validateTransfer(transferId);
      await loadData();
    } catch (validationError) {
      setError(validationError.message || "Transfer validation failed.");
    } finally {
      setActionId(null);
    }
  };

  const actionFor = (transfer) => {
    const busy = actionId === transfer.id;
    const buttonClass =
      "rounded-md px-3 py-2 text-sm font-semibold text-white disabled:opacity-50";
    if (transfer.status === "draft") {
      return (
        <button
          className={`${buttonClass} bg-amber-600 hover:bg-amber-700`}
          disabled={busy}
          onClick={() => handleStatus(transfer.id, "waiting")}
        >
          Send
        </button>
      );
    }
    if (transfer.status === "waiting") {
      return (
        <button
          className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}
          disabled={busy}
          onClick={() => handleStatus(transfer.id, "ready")}
        >
          Ready
        </button>
      );
    }
    if (transfer.status === "ready") {
      return (
        <button
          className={`${buttonClass} bg-emerald-600 hover:bg-emerald-700`}
          disabled={busy}
          onClick={() => handleValidate(transfer.id)}
        >
          {busy ? "Validating..." : "Validate"}
        </button>
      );
    }
    return <span className="text-sm text-slate-500">No action</span>;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Internal Transfers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Move stock between warehouse locations.
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
          + New Transfer
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
        <Summary title="Total Transfers" value={transfers.length} />
        <Summary
          title="Scheduled"
          value={
            transfers.filter((transfer) =>
              ["waiting", "ready"].includes(transfer.status),
            ).length
          }
        />
        <Summary
          title="Completed"
          value={
            transfers.filter((transfer) => transfer.status === "done").length
          }
        />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search transfer, product or SKU..."
          className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 sm:max-w-md"
        />
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Transfer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading transfers...
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No transfers found.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => {
                  const item = transfer.transfer_items?.[0];
                  return (
                    <tr key={transfer.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {transfer.transfer_number}
                      </td>
                      <td className="px-4 py-3">
                        {item?.products?.name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {getWarehouseName(transfer.source_warehouse_id)} /{" "}
                        {getLocationName(transfer.source_location_id)}
                      </td>
                      <td className="px-4 py-3">
                        {getWarehouseName(transfer.destination_warehouse_id)} /{" "}
                        {getLocationName(transfer.destination_location_id)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item?.quantity ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[transfer.status] || statusStyles.draft}`}
                        >
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{actionFor(transfer)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={handleCreate}
            className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-md bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">New Transfer</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-slate-900"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Transfer Number">
                <input
                  name="transferNumber"
                  value={form.transferNumber}
                  onChange={changeForm}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Scheduled Date">
                <input
                  type="date"
                  name="scheduledDate"
                  value={form.scheduledDate}
                  onChange={changeForm}
                  className={inputClass}
                />
              </Field>
              <Field label="Source Warehouse">
                <select
                  name="sourceWarehouseId"
                  value={form.sourceWarehouseId}
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
              <Field label="Source Location">
                <select
                  name="sourceLocationId"
                  value={form.sourceLocationId}
                  onChange={changeForm}
                  required
                  disabled={!form.sourceWarehouseId}
                  className={inputClass}
                >
                  <option value="">Select location</option>
                  {locations
                    .filter(
                      (location) =>
                        location.warehouse_id === form.sourceWarehouseId,
                    )
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Destination Warehouse">
                <select
                  name="destinationWarehouseId"
                  value={form.destinationWarehouseId}
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
              <Field label="Destination Location">
                <select
                  name="destinationLocationId"
                  value={form.destinationLocationId}
                  onChange={changeForm}
                  required
                  disabled={!form.destinationWarehouseId}
                  className={inputClass}
                >
                  <option value="">Select location</option>
                  {locations
                    .filter(
                      (location) =>
                        location.warehouse_id === form.destinationWarehouseId,
                    )
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                </select>
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
              <Field label="Quantity">
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  name="quantity"
                  value={form.quantity}
                  onChange={changeForm}
                  required
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                name="notes"
                value={form.notes}
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
