import { useState } from "react";

const initialReceipts = [
  {
    id: "REC-001",
    supplier: "ABC Suppliers",
    warehouse: "Main Warehouse",
    date: "2026-09-26",
    products: 5,
    quantity: 120,
    status: "Pending",
  },
  {
    id: "REC-002",
    supplier: "XYZ Traders",
    warehouse: "Secondary Warehouse",
    date: "2026-09-25",
    products: 3,
    quantity: 75,
    status: "Received",
  },
  {
    id: "REC-003",
    supplier: "Global Distributors",
    warehouse: "Main Warehouse",
    date: "2026-09-24",
    products: 8,
    quantity: 210,
    status: "Pending",
  },
];

function Receipts() {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredReceipts = receipts.filter((receipt) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      receipt.id.toLowerCase().includes(searchText) ||
      receipt.supplier.toLowerCase().includes(searchText) ||
      receipt.warehouse.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || receipt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const markAsReceived = (id) => {
    setReceipts((currentReceipts) =>
      currentReceipts.map((receipt) =>
        receipt.id === id
          ? { ...receipt, status: "Received" }
          : receipt
      )
    );
  };

  const pendingCount = receipts.filter(
    (receipt) => receipt.status === "Pending"
  ).length;

  const receivedCount = receipts.filter(
    (receipt) => receipt.status === "Received"
  ).length;

  const totalQuantity = receipts.reduce(
    (total, receipt) => total + receipt.quantity,
    0
  );

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
          onClick={() => alert("New Receipt form will be connected next.")}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          + New Receipt
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Receipts
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {receipts.length}
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
            Total Items Received
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
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Receipt ID
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
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {receipt.id}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {receipt.supplier}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {receipt.warehouse}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {receipt.date}
                    </td>

                    <td className="px-5 py-4 text-center text-slate-700">
                      {receipt.products}
                    </td>

                    <td className="px-5 py-4 text-center font-medium text-slate-700">
                      {receipt.quantity}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          receipt.status === "Received"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {receipt.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {receipt.status === "Pending" ? (
                        <button
                          onClick={() => markAsReceived(receipt.id)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Receive
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
                    No receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-slate-500">
        Showing {filteredReceipts.length} of {receipts.length} receipts
        {" • "}
        {receivedCount} received
      </div>
    </div>
  );
}

export default Receipts;