import { useEffect, useMemo, useState } from "react";
import {
  getReceipts,
  getSuppliers,
  getWarehouses,
  getProducts,
  getLocations,
  createReceipt,
  addReceiptItem,
  updateReceiptStatus,
  validateReceipt,
} from "../services/receipts";

const statusLabels = {
  draft: "Draft",
  waiting: "Waiting",
  ready: "Ready",
  done: "Done",
};

const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  waiting: "bg-yellow-100 text-yellow-700",
  ready: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    receiptNumber: "",
    supplierId: "",
    warehouseId: "",
    destinationLocationId: "",
    productId: "",
    quantity: "",
    expectedDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        receiptsData,
        suppliersData,
        warehousesData,
        productsData,
      ] = await Promise.all([
        getReceipts(),
        getSuppliers(),
        getWarehouses(),
        getProducts(),
      ]);

      setReceipts(receiptsData);
      setSuppliers(suppliersData);
      setWarehouses(warehousesData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load receipts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function loadWarehouseLocations() {
      if (!form.warehouseId) {
        setLocations([]);
        return;
      }

      try {
        const data = await getLocations(form.warehouseId);
        setLocations(data);
      } catch (err) {
        console.error(err);
        setLocations([]);
        setError(err.message || "Failed to load locations.");
      }
    }

    loadWarehouseLocations();
  }, [form.warehouseId]);

  const filteredReceipts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return receipts.filter((receipt) => {
      const supplierName = receipt.suppliers?.name || "No supplier";
      const warehouseName = receipt.warehouses?.name || "Unknown warehouse";

      const matchesSearch =
        receipt.receipt_number?.toLowerCase().includes(searchText) ||
        supplierName.toLowerCase().includes(searchText) ||
        warehouseName.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || receipt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, search, statusFilter]);

  const totalReceipts = receipts.length;

  const draftCount = receipts.filter(
    (receipt) => receipt.status === "draft"
  ).length;

  const readyCount = receipts.filter(
    (receipt) => receipt.status === "ready"
  ).length;

  const doneCount = receipts.filter(
    (receipt) => receipt.status === "done"
  ).length;

  const totalQuantity = receipts.reduce((total, receipt) => {
    const receiptQuantity = (receipt.receipt_items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    return total + receiptQuantity;
  }, 0);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "warehouseId") {
      setForm((current) => ({
        ...current,
        warehouseId: value,
        destinationLocationId: "",
      }));
    }
  }

  function resetForm() {
    setForm({
      receiptNumber: "",
      supplierId: "",
      warehouseId: "",
      destinationLocationId: "",
      productId: "",
      quantity: "",
      expectedDate: "",
      notes: "",
    });
  }

  async function handleCreateReceipt(event) {
    event.preventDefault();

    if (
      !form.receiptNumber ||
      !form.warehouseId ||
      !form.destinationLocationId ||
      !form.productId ||
      !form.quantity
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const receipt = await createReceipt({
        receiptNumber: form.receiptNumber.trim(),
        supplierId: form.supplierId || null,
        warehouseId: form.warehouseId,
        destinationLocationId: form.destinationLocationId,
        expectedDate: form.expectedDate || null,
        notes: form.notes.trim() || null,
      });

      await addReceiptItem({
        receiptId: receipt.id,
        productId: form.productId,
        quantity: form.quantity,
      });

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create receipt.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(receiptId, nextStatus) {
    try {
      setActionId(receiptId);
      setError("");

      await updateReceiptStatus(receiptId, nextStatus);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update receipt.");
    } finally {
      setActionId(null);
    }
  }

  async function handleValidate(receiptId) {
    try {
      setActionId(receiptId);
      setError("");

      await validateReceipt(receiptId);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to validate receipt.");
    } finally {
      setActionId(null);
    }
  }

  function getAction(receipt) {
    const busy = actionId === receipt.id;

    if (receipt.status === "draft") {
      return (
        <button
          onClick={() => handleStatusChange(receipt.id, "waiting")}
          disabled={busy}
          className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Updating..." : "Send"}
        </button>
      );
    }

    if (receipt.status === "waiting") {
      return (
        <button
          onClick={() => handleStatusChange(receipt.id, "ready")}
          disabled={busy}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Updating..." : "Ready"}
        </button>
      );
    }

    if (receipt.status === "ready") {
      return (
        <button
          onClick={() => handleValidate(receipt.id)}
          disabled={busy}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Validating..." : "Validate"}
        </button>
      );
    }

    return (
      <span className="text-sm font-medium text-green-600">
        ✓ Completed
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Receipts
          </h1>

          <p className="mt-1 text-slate-500">
            Manage incoming inventory receipts.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + New Receipt
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Receipts
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalReceipts}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Draft
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-600">
            {draftCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Ready
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {readyCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Completed
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {doneCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Quantity
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalQuantity}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search receipt, supplier or warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Receipt
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Supplier
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Warehouse
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Date
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                  Products
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                  Quantity
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading receipts...
                  </td>
                </tr>
              ) : filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => {
                  const quantity = (receipt.receipt_items || []).reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0
                  );

                  const supplierName =
                    receipt.suppliers?.name || "No supplier";

                  const warehouseName =
                    receipt.warehouses?.name || "Unknown warehouse";

                  return (
                    <tr
                      key={receipt.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-blue-600">
                        {receipt.receipt_number}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {supplierName}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {warehouseName}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {receipt.expected_date ||
                          new Date(receipt.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-center text-slate-700">
                        {receipt.receipt_items?.length || 0}
                      </td>

                      <td className="px-5 py-4 text-center font-medium text-slate-700">
                        {quantity}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[receipt.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {statusLabels[receipt.status] || receipt.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {getAction(receipt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Showing {filteredReceipts.length} of {receipts.length} receipts
      </div>

      {/* New Receipt Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  New Receipt
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create an incoming stock receipt.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateReceipt}
              className="space-y-5 p-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Receipt Number *
                  </label>

                  <input
                    name="receiptNumber"
                    value={form.receiptNumber}
                    onChange={handleFormChange}
                    placeholder="REC-001"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Expected Date
                  </label>

                  <input
                    type="date"
                    name="expectedDate"
                    value={form.expectedDate}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Supplier
                  </label>

                  <select
                    name="supplierId"
                    value={form.supplierId}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Supplier</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Warehouse *
                  </label>

                  <select
                    name="warehouseId"
                    value={form.warehouseId}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Warehouse</option>

                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                        {warehouse.code
                          ? ` (${warehouse.code})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Destination Location *
                  </label>

                  <select
                    name="destinationLocationId"
                    value={form.destinationLocationId}
                    onChange={handleFormChange}
                    disabled={!form.warehouseId}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
                    required
                  >
                    <option value="">
                      {form.warehouseId
                        ? "Select Location"
                        : "Select Warehouse First"}
                    </option>

                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                        {location.code
                          ? ` (${location.code})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product *
                  </label>

                  <select
                    name="productId"
                    value={form.productId}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Product</option>

                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                        {product.sku ? ` (${product.sku})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleFormChange}
                    placeholder="100"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Optional notes..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipts;