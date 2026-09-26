import { useState } from "react";

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    product: "",
    warehouse: "",
    systemQty: "",
    countedQty: "",
    reason: "",
  });

  const createAdjustment = () => {
    if (
      !form.product ||
      !form.warehouse ||
      !form.systemQty ||
      !form.countedQty ||
      !form.reason
    ) {
      alert("Please fill all fields");
      return;
    }

    const systemQty = Number(form.systemQty);
    const countedQty = Number(form.countedQty);
    const difference = countedQty - systemQty;

    const newAdjustment = {
      id: Date.now(),
      reference: `ADJ-${Date.now()}`,
      ...form,
      systemQty,
      countedQty,
      difference,
      date: new Date().toLocaleDateString(),
      status: "Validated",
    };

    setAdjustments([newAdjustment, ...adjustments]);

    setForm({
      product: "",
      warehouse: "",
      systemQty: "",
      countedQty: "",
      reason: "",
    });

    setShowModal(false);
  };

  const totalDifference = adjustments.reduce(
    (sum, a) => sum + a.difference,
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
          <h1>Adjustments</h1>
          <p style={{ color: "#64748b" }}>
            Manage inventory corrections and stock counts.
          </p>
        </div>

        <button
          style={buttonStyle}
          onClick={() => setShowModal(true)}
        >
          + New Adjustment
        </button>
      </div>

      {/* STATS */}

      <div style={statsGrid}>
        <Card
          title="Total Adjustments"
          value={adjustments.length}
        />

        <Card
          title="Validated"
          value={
            adjustments.filter(
              (a) => a.status === "Validated"
            ).length
          }
          color="#16a34a"
        />

        <Card
          title="Positive Variance"
          value={
            adjustments.filter(
              (a) => a.difference > 0
            ).length
          }
          color="#2563eb"
        />

        <Card
          title="Net Difference"
          value={totalDifference}
          color={
            totalDifference >= 0
              ? "#16a34a"
              : "#dc2626"
          }
        />
      </div>

      {/* SEARCH */}

      <div style={cardStyle}>
        <input
          placeholder="Search adjustment..."
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
              <th style={th}>Reference</th>
              <th style={th}>Product</th>
              <th style={th}>Warehouse</th>
              <th style={th}>System Qty</th>
              <th style={th}>Counted Qty</th>
              <th style={th}>Difference</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {adjustments.map((adj) => (
              <tr key={adj.id}>
                <td style={td}>
                  {adj.reference}
                </td>

                <td style={td}>
                  {adj.product}
                </td>

                <td style={td}>
                  {adj.warehouse}
                </td>

                <td style={td}>
                  {adj.systemQty}
                </td>

                <td style={td}>
                  {adj.countedQty}
                </td>

                <td
                  style={{
                    ...td,
                    color:
                      adj.difference >= 0
                        ? "green"
                        : "red",
                    fontWeight: "bold",
                  }}
                >
                  {adj.difference > 0
                    ? `+${adj.difference}`
                    : adj.difference}
                </td>

                <td style={td}>
                  {adj.date}
                </td>

                <td style={td}>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "6px 12px",
                      borderRadius: "20px",
                    }}
                  >
                    {adj.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {adjustments.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#64748b",
            }}
          >
            No adjustments found.
          </div>
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2>Create Adjustment</h2>

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
              placeholder="Warehouse"
              value={form.warehouse}
              onChange={(e) =>
                setForm({
                  ...form,
                  warehouse:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="System Quantity"
              value={form.systemQty}
              onChange={(e) =>
                setForm({
                  ...form,
                  systemQty:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Counted Quantity"
              value={form.countedQty}
              onChange={(e) =>
                setForm({
                  ...form,
                  countedQty:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Reason"
              value={form.reason}
              onChange={(e) =>
                setForm({
                  ...form,
                  reason:
                    e.target.value,
                })
              }
              style={{
                ...inputStyle,
                minHeight: "90px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={createAdjustment}
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
  boxSizing: "border-box",
};

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
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
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modal = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "550px",
  maxWidth: "90%",
};