import { useState } from "react";

export default function Adjustments() {
  const systemQty = 100;

  const [form, setForm] = useState({
    product: "",
    warehouse: "",
    location: "",
    countedQty: "",
    reason: "",
  });

  const [adjustments, setAdjustments] = useState([]);
  const [lastAdjustment, setLastAdjustment] = useState(null);

  const countedQty = Number(form.countedQty) || 0;
  const difference = countedQty - systemQty;

  const adjustmentType =
    difference > 0
      ? "Stock Gain"
      : difference < 0
      ? "Stock Loss"
      : "No Change";

  const handleCreate = () => {
    if (
      !form.product ||
      !form.warehouse ||
      !form.location ||
      !form.countedQty
    ) {
      alert("Please fill all fields");
      return;
    }

    const confirmed = window.confirm(
      `Adjust stock from ${systemQty} to ${countedQty}?`
    );

    if (!confirmed) return;

    const newAdjustment = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      ...form,
      systemQty,
      countedQty,
      difference,
      adjustmentType,
      status: "Validated",
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setLastAdjustment(newAdjustment);

    setForm({
      product: "",
      warehouse: "",
      location: "",
      countedQty: "",
      reason: "",
    });
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        📦 Inventory Adjustments
      </h2>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div style={cardStyle}>
          <h4>System Qty</h4>
          <h2>{systemQty}</h2>
        </div>

        <div style={cardStyle}>
          <h4>Counted Qty</h4>
          <h2>{countedQty}</h2>
        </div>

        <div style={cardStyle}>
          <h4>Difference</h4>
          <h2
            style={{
              color:
                difference > 0
                  ? "green"
                  : difference < 0
                  ? "red"
                  : "#444",
            }}
          >
            {difference > 0 ? `+${difference}` : difference}
          </h2>
        </div>
      </div>

      {/* FORM + VALIDATION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
        }}
      >
        {/* FORM */}
        <div style={boxStyle}>
          <h3>Create Adjustment</h3>

          <input
            style={inputStyle}
            placeholder="Product"
            value={form.product}
            onChange={(e) =>
              setForm({ ...form, product: e.target.value })
            }
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              style={inputStyle}
              placeholder="Warehouse"
              value={form.warehouse}
              onChange={(e) =>
                setForm({ ...form, warehouse: e.target.value })
              }
            />

            <input
              style={inputStyle}
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />
          </div>

          <div
            style={{
              background: "#f3f4f6",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontWeight: "bold",
            }}
          >
            System Quantity: {systemQty}
          </div>

          <input
            type="number"
            style={inputStyle}
            placeholder="Counted Quantity"
            value={form.countedQty}
            onChange={(e) =>
              setForm({ ...form, countedQty: e.target.value })
            }
          />

          <input
            style={inputStyle}
            placeholder="Reason"
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />

          <button style={btnStyle} onClick={handleCreate}>
            Validate Adjustment
          </button>
        </div>

        {/* VALIDATION CARD */}
        <div style={boxStyle}>
          <h3>Adjustment Validation</h3>

          <p><b>Before</b></p>
          <p>System Quantity: {systemQty}</p>

          <hr />

          <p><b>Counted Quantity</b></p>
          <p>{countedQty}</p>

          <hr />

          <p><b>Difference</b></p>

          <p
            style={{
              color:
                difference > 0
                  ? "green"
                  : difference < 0
                  ? "red"
                  : "#444",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            {difference > 0 ? `+${difference}` : difference}
          </p>

          <hr />

          <p><b>Adjustment Type</b></p>
          <p>{adjustmentType}</p>

          <hr />

          <p><b>Final Stock</b></p>
          <p>
            {systemQty} → {countedQty}
          </p>

          <hr />

          <p
            style={{
              color: "#2563eb",
              fontWeight: "bold",
            }}
          >
            Ledger Entry Ready ✓
          </p>
        </div>
      </div>

      {/* HISTORY */}
      <div
        style={{
          marginTop: "30px",
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h3>Adjustment History</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr style={{ background: "#2563eb", color: "white" }}>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Warehouse</th>
              <th style={thStyle}>System</th>
              <th style={thStyle}>Counted</th>
              <th style={thStyle}>Difference</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {adjustments.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No adjustments yet
                </td>
              </tr>
            ) : (
              adjustments.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.time}</td>
                  <td style={tdStyle}>{item.product}</td>
                  <td style={tdStyle}>{item.warehouse}</td>
                  <td style={tdStyle}>{item.systemQty}</td>
                  <td style={tdStyle}>{item.countedQty}</td>

                  <td
                    style={{
                      ...tdStyle,
                      color:
                        item.difference > 0
                          ? "green"
                          : item.difference < 0
                          ? "red"
                          : "#444",
                      fontWeight: "bold",
                    }}
                  >
                    {item.difference > 0
                      ? `+${item.difference}`
                      : item.difference}
                  </td>

                  <td style={tdStyle}>
                    {item.adjustmentType}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      Validated
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* STYLES */

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const boxStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "15px",
  boxSizing: "border-box",
};

const btnStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const thStyle = {
  padding: "12px",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};