import { useState } from "react";

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    product: "",
    fromWarehouse: "",
    toWarehouse: "",
    quantity: "",
  });

  const createTransfer = () => {
    if (
      !form.product ||
      !form.fromWarehouse ||
      !form.toWarehouse ||
      !form.quantity
    ) {
      alert("Fill all fields");
      return;
    }

    const newTransfer = {
      id: Date.now(),
      reference: `TRF-${Date.now()}`,
      ...form,
      quantity: Number(form.quantity),
      date: new Date().toLocaleDateString(),
      status: "Ready",
    };

    setTransfers([newTransfer, ...transfers]);

    setForm({
      product: "",
      fromWarehouse: "",
      toWarehouse: "",
      quantity: "",
    });

    setShowModal(false);
  };

  const totalQty = transfers.reduce(
    (sum, t) => sum + t.quantity,
    0
  );

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1>Transfers</h1>
          <p style={{ color: "#64748b" }}>
            Manage internal inventory transfers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={buttonStyle}
        >
          + New Transfer
        </button>
      </div>

      {/* STATS */}

      <div style={statsGrid}>
        <Card
          title="Total Transfers"
          value={transfers.length}
        />

        <Card
          title="Ready"
          value={
            transfers.filter(
              (t) => t.status === "Ready"
            ).length
          }
          color="#2563eb"
        />

        <Card
          title="Completed"
          value={
            transfers.filter(
              (t) => t.status === "Completed"
            ).length
          }
          color="#16a34a"
        />

        <Card
          title="Total Quantity"
          value={totalQty}
        />
      </div>

      {/* FILTER */}

      <div style={cardStyle}>
        <input
          placeholder="Search transfer..."
          style={inputStyle}
        />
      </div>

      {/* TABLE */}

      <div
        style={{
          ...cardStyle,
          marginTop: "20px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f1f5f9",
              }}
            >
              <th style={th}>Transfer</th>
              <th style={th}>Product</th>
              <th style={th}>From</th>
              <th style={th}>To</th>
              <th style={th}>Qty</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {transfers.map((t) => (
              <tr key={t.id}>
                <td style={td}>{t.reference}</td>

                <td style={td}>{t.product}</td>

                <td style={td}>
                  {t.fromWarehouse}
                </td>

                <td style={td}>
                  {t.toWarehouse}
                </td>

                <td style={td}>{t.quantity}</td>

                <td style={td}>{t.date}</td>

                <td style={td}>
                  <span
                    style={{
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      padding:
                        "6px 12px",
                      borderRadius:
                        "20px",
                    }}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transfers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#64748b",
            }}
          >
            No transfers found.
          </div>
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2>Create Transfer</h2>

            <input
              placeholder="Product"
              value={form.product}
              onChange={(e) =>
                setForm({
                  ...form,
                  product: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="From Warehouse"
              value={form.fromWarehouse}
              onChange={(e) =>
                setForm({
                  ...form,
                  fromWarehouse:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="To Warehouse"
              value={form.toWarehouse}
              onChange={(e) =>
                setForm({
                  ...form,
                  toWarehouse:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={createTransfer}
                style={buttonStyle}
              >
                Save
              </button>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                style={{
                  ...buttonStyle,
                  background: "#64748b",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  color = "#111827",
}) {
  return (
    <div style={cardStyle}>
      <p>{title}</p>
      <h1 style={{ color }}>{value}</h1>
    </div>
  );
}

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
  marginBottom: "20px",
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "14px",
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

const th = {
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderTop: "1px solid #eee",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "500px",
};