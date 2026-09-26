import { useState } from "react";

const initialDeliveries = [
  {
    id: "DEL-001",
    customer: "ABC Retailers",
    warehouse: "Main Warehouse",
    date: "2026-09-26",
    products: 4,
    quantity: 80,
    status: "Pending",
  },
  {
    id: "DEL-002",
    customer: "XYZ Stores",
    warehouse: "Secondary Warehouse",
    date: "2026-09-25",
    products: 2,
    quantity: 45,
    status: "Delivered",
  },
  {
    id: "DEL-003",
    customer: "Global Mart",
    warehouse: "Main Warehouse",
    date: "2026-09-24",
    products: 6,
    quantity: 130,
    status: "Pending",
  },
];

function Deliveries() {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredDeliveries = deliveries.filter((delivery) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      delivery.id.toLowerCase().includes(searchText) ||
      delivery.customer.toLowerCase().includes(searchText) ||
      delivery.warehouse.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || delivery.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const markAsDelivered = (id) => {
    setDeliveries((currentDeliveries) =>
      currentDeliveries.map((delivery) =>
        delivery.id === id
          ? { ...delivery, status: "Delivered" }
          : delivery
      )
    );
  };

  const pendingCount = deliveries.filter(
    (delivery) => delivery.status === "Pending"
  ).length;

  const deliveredCount = deliveries.filter(
    (delivery) => delivery.status === "Delivered"
  ).length;

  const totalQuantity = deliveries.reduce(
    (total, delivery) => total + delivery.quantity,
    0
  );

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
          onClick={() =>
            alert("New Delivery form will be connected next.")
          }
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + New Delivery
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Deliveries
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {deliveries.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Items Delivered
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {totalQuantity}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search delivery, customer or warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Delivery ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Customer
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
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {delivery.id}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {delivery.customer}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {delivery.warehouse}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {delivery.date}
                    </td>

                    <td className="px-5 py-4 text-center text-slate-700">
                      {delivery.products}
                    </td>

                    <td className="px-5 py-4 text-center font-medium text-slate-700">
                      {delivery.quantity}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          delivery.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {delivery.status === "Pending" ? (
                        <button
                          onClick={() => markAsDelivered(delivery.id)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Deliver
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-green-600">
                          ✓ Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No deliveries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-slate-500">
        Showing {filteredDeliveries.length} of {deliveries.length} deliveries
        {" • "}
        {deliveredCount} delivered
      </div>
    </div>
  );
}

export default Deliveries;