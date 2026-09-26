import { useCallback, useEffect, useMemo, useState } from "react";
import { getMoveHistory, getMovementOptions } from "../services/movements";

const emptyFilters = {
  productId: "",
  movementType: "",
  warehouseId: "",
  locationId: "",
  dateFrom: "",
  dateTo: "",
};

const movementLabels = {
  receipt: "Receipt",
  delivery: "Delivery",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  adjustment: "Adjustment",
};

export default function MoveHistory() {
  const [filters, setFilters] = useState(emptyFilters);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMovements(await getMoveHistory(filters));
    } catch (loadError) {
      setError(loadError.message || "Failed to load movement history.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getMovementOptions()
      .then((options) => {
        setProducts(options.products);
        setWarehouses(options.warehouses);
        setLocations(options.locations);
      })
      .catch((loadError) =>
        setError(loadError.message || "Failed to load filters."),
      );
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const summary = useMemo(() => {
    const inbound = movements
      .filter((movement) => Number(movement.quantity) > 0)
      .reduce((total, movement) => total + Number(movement.quantity), 0);
    const outbound = movements
      .filter((movement) => Number(movement.quantity) < 0)
      .reduce((total, movement) => total + Number(movement.quantity), 0);
    return { inbound, outbound, net: inbound + outbound };
  }, [movements]);

  const setFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "warehouseId" ? { locationId: "" } : {}),
    }));
  };

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
            Inventory audit
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Move History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track every inventory movement across your warehouses.
          </p>
        </div>
        <button
          type="button"
          onClick={loadHistory}
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary title="Movements" value={movements.length} />
        <Summary
          title="Stock In"
          value={`+${summary.inbound}`}
          tone="text-emerald-700"
        />
        <Summary
          title="Stock Out"
          value={summary.outbound}
          tone="text-red-700"
        />
        <Summary title="Net Movement" value={summary.net} />
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Select
            label="Product"
            value={filters.productId}
            onChange={(value) => setFilter("productId", value)}
          >
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </Select>
          <Select
            label="Movement Type"
            value={filters.movementType}
            onChange={(value) => setFilter("movementType", value)}
          >
            <option value="">All movement types</option>
            {Object.entries(movementLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Warehouse"
            value={filters.warehouseId}
            onChange={(value) => setFilter("warehouseId", value)}
          >
            <option value="">All warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </Select>
          <Select
            label="Location"
            value={filters.locationId}
            onChange={(value) => setFilter("locationId", value)}
          >
            <option value="">All locations</option>
            {locations
              .filter(
                (location) =>
                  !filters.warehouseId ||
                  location.warehouse_id === filters.warehouseId,
              )
              .map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
          </Select>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-1.5 block">From</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilter("dateFrom", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-1.5 block">To</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilter("dateTo", event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => setFilters(emptyFilters)}
          className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          Clear filters
        </button>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Movement</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading movement history...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No movement history found.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(movement.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">
                        {movement.product_name}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        {movement.sku}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {movementLabels[movement.movement_type] ||
                        movement.movement_type}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${Number(movement.quantity) < 0 ? "text-red-600" : "text-emerald-700"}`}
                    >
                      {Number(movement.quantity) > 0 ? "+" : ""}
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-3">{movement.warehouse_name}</td>
                    <td className="px-4 py-3">{movement.location_name}</td>
                    <td className="px-4 py-3">
                      {movement.reference_number || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {movement.created_by_name || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Summary({ title, value, tone = "text-slate-900" }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {children}
      </select>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500";
