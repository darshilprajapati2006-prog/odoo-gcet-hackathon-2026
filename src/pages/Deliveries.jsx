import { useEffect, useMemo, useState } from "react";
import {
  getDeliveries,
  getCustomers,
  getWarehouses,
  getProducts,
  getLocations,
  createDelivery,
  addDeliveryItem,
  updateDeliveryStatus,
  validateDelivery,
} from "../services/deliveries";

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

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    deliveryNumber: "",
    customerId: "",
    warehouseId: "",
    sourceLocationId: "",
    productId: "",
    quantity: "",
    scheduledDate: "",
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
        deliveriesData,
        customersData,
        warehousesData,
        productsData,
      ] = await Promise.all([
        getDeliveries(),
        getCustomers(),
        getWarehouses(),
        getProducts(),
      ]);

      setDeliveries(deliveriesData);
      setCustomers(customersData);
      setWarehouses(warehousesData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load deliveries.");
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
        setError(err.message || "Failed to load locations.");
      }
    }

    loadWarehouseLocations();
  }, [form.warehouseId]);

  const filteredDeliveries = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return deliveries.filter((delivery) => {
      const customerName =
        delivery.customers?.name || "No customer";

      const warehouseName =
        delivery.warehouses?.name || "Unknown warehouse";

      const matchesSearch =
        delivery.delivery_number
          ?.toLowerCase()
          .includes(searchText) ||
        customerName.toLowerCase().includes(searchText) ||
        warehouseName.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        delivery.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, statusFilter]);

  const totalQuantity = deliveries.reduce((total, delivery) => {
    const quantity = (delivery.delivery_items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    return total + quantity;
  }, 0);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "warehouseId"
        ? { sourceLocationId: "" }
        : {}),
    }));
  }

  function resetForm() {
    setForm({
      deliveryNumber: "",
      customerId: "",
      warehouseId: "",
      sourceLocationId: "",
      productId: "",
      quantity: "",
      scheduledDate: "",
      notes: "",
    });
  }

  async function handleCreateDelivery(event) {
    event.preventDefault();

    if (
      !form.deliveryNumber ||
      !form.warehouseId ||
      !form.sourceLocationId ||
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

      const delivery = await createDelivery({
        deliveryNumber: form.deliveryNumber.trim(),
        customerId: form.customerId || null,
        warehouseId: form.warehouseId,
        sourceLocationId: form.sourceLocationId,
        scheduledDate: form.scheduledDate || null,
        notes: form.notes.trim() || null,
      });

      await addDeliveryItem({
        deliveryId: delivery.id,
        productId: form.productId,
        quantity: form.quantity,
      });

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create delivery.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(deliveryId, status) {
    try {
      setActionId(deliveryId);
      setError("");

      await updateDeliveryStatus(deliveryId, status);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update delivery.");
    } finally {
      setActionId(null);
    }
  }

  async function handleValidate(deliveryId) {
    try {
      setActionId(deliveryId);
      setError("");

      await validateDelivery(deliveryId);
      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Delivery validation failed. Check available stock."
      );
    } finally {
      setActionId(null);
    }
  }

  function getAction(delivery) {
    const busy = actionId === delivery.id;

    if (delivery.status === "draft") {
      return (
        <button
          onClick={() =>
            handleStatusChange(delivery.id, "waiting")
          }
          disabled={busy}
          className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
        >
          {busy ? "Updating..." : "Send"}
        </button>
      );
    }

    if (delivery.status === "waiting") {
      return (
        <button
          onClick={() =>
            handleStatusChange(delivery.id, "ready")
          }
          disabled={busy}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Updating..." : "Ready"}
        </button>
      );
    }

    if (delivery.status === "ready") {
      return (
        <button
          onClick={() => handleValidate(delivery.id)}
          disabled={busy}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
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
            Deliveries
          </h1>
          <p className="mt-1 text-slate-500">
            Manage outgoing inventory deliveries.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          + New Delivery
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Deliveries</p>
          <p className="mt-2 text-3xl font-bold">
            {deliveries.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Waiting</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {
              deliveries.filter((d) => d.status === "waiting")
                .length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {
              deliveries.filter((d) => d.status === "done")
                .length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Quantity</p>
          <p className="mt-2 text-3xl font-bold">
            {totalQuantity}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search delivery, customer or warehouse..."
            className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border px-4 py-3"
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
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-100">
              <tr>
                {[
                  "Delivery",
                  "Customer",
                  "Warehouse",
                  "Date",
                  "Products",
                  "Quantity",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-sm font-semibold text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-10 text-center text-slate-500"
                  >
                    Loading deliveries...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-10 text-center text-slate-500"
                  >
                    No deliveries found.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const quantity = (
                    delivery.delivery_items || []
                  ).reduce(
                    (sum, item) =>
                      sum + Number(item.quantity || 0),
                    0
                  );

                  return (
                    <tr
                      key={delivery.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-blue-600">
                        {delivery.delivery_number}
                      </td>

                      <td className="px-5 py-4">
                        {delivery.customers?.name ||
                          "No customer"}
                      </td>

                      <td className="px-5 py-4">
                        {delivery.warehouses?.name || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {delivery.scheduled_date ||
                          new Date(
                            delivery.created_at
                          ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        {delivery.delivery_items?.length || 0}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {quantity}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[delivery.status] ||
                            "bg-slate-100"
                          }`}
                        >
                          {statusLabels[delivery.status] ||
                            delivery.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {getAction(delivery)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold">
                  New Delivery
                </h2>
                <p className="text-sm text-slate-500">
                  Create an outgoing stock delivery.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateDelivery}
              className="space-y-5 p-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Delivery Number *"
                  name="deliveryNumber"
                  value={form.deliveryNumber}
                  onChange={handleFormChange}
                  placeholder="DEL-001"
                  required
                />

                <Input
                  label="Scheduled Date"
                  type="date"
                  name="scheduledDate"
                  value={form.scheduledDate}
                  onChange={handleFormChange}
                />

                <Select
                  label="Customer"
                  name="customerId"
                  value={form.customerId}
                  onChange={handleFormChange}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Warehouse *"
                  name="warehouseId"
                  value={form.warehouseId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name}
                      {warehouse.code
                        ? ` (${warehouse.code})`
                        : ""}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Source Location *"
                  name="sourceLocationId"
                  value={form.sourceLocationId}
                  onChange={handleFormChange}
                  disabled={!form.warehouseId}
                  required
                >
                  <option value="">
                    {form.warehouseId
                      ? "Select Location"
                      : "Select Warehouse First"}
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                      {location.code
                        ? ` (${location.code})`
                        : ""}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Product *"
                  name="productId"
                  value={form.productId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Product</option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                      {product.sku
                        ? ` (${product.sku})`
                        : ""}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Quantity *"
                  type="number"
                  min="0.001"
                  step="0.001"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <select
        {...props}
        className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
      >
        {children}
      </select>
    </div>
  );
}

export default Deliveries;