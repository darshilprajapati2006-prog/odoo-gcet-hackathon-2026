import { useState } from "react";

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);

  const [form, setForm] = useState({
    product: "",
    sourceWarehouse: "",
    sourceLocation: "",
    destinationWarehouse: "",
    destinationLocation: "",
    quantity: "",
  });

  // Demo stock
  const MAIN_STORAGE = 100;
  const PRODUCTION_FLOOR = 20;

  const qty = Number(form.quantity) || 0;

  const afterMain = MAIN_STORAGE - qty;
  const afterProduction = PRODUCTION_FLOOR + qty;

  const createTransfer = () => {
    if (
      !form.product ||
      !form.sourceWarehouse ||
      !form.sourceLocation ||
      !form.destinationWarehouse ||
      !form.destinationLocation ||
      !form.quantity
    ) {
      alert("Please fill all fields");
      return;
    }

    if (qty > MAIN_STORAGE) {
      alert(
        `Insufficient stock!\nAvailable: ${MAIN_STORAGE}\nRequested: ${qty}`
      );
      return;
    }

    const newTransfer = {
      id: Date.now(),
      ...form,
      quantity: qty,
      status: "Ready",
      beforeMain: MAIN_STORAGE,
      beforeProduction: PRODUCTION_FLOOR,
      afterMain,
      afterProduction,
    };

    setTransfers([newTransfer, ...transfers]);

    setForm({
      product: "",
      sourceWarehouse: "",
      sourceLocation: "",
      destinationWarehouse: "",
      destinationLocation: "",
      quantity: "",
    });
  };

  const latestTransfer = transfers[0];

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#1f2937",
        }}
      >
        Internal Transfers
      </h2>

      {/* TOP SECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {/* FORM CARD */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Create Transfer</h3>

          <input
            placeholder="Product"
            value={form.product}
            onChange={(e) =>
              setForm({ ...form, product: e.target.value })
            }
            style={inputStyle}
          />

          <div style={rowStyle}>
            <input
              placeholder="Source Warehouse"
              value={form.sourceWarehouse}
              onChange={(e) =>
                setForm({
                  ...form,
                  sourceWarehouse: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Source Location"
              value={form.sourceLocation}
              onChange={(e) =>
                setForm({
                  ...form,
                  sourceLocation: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <div style={rowStyle}>
            <input
              placeholder="Destination Warehouse"
              value={form.destinationWarehouse}
              onChange={(e) =>
                setForm({
                  ...form,
                  destinationWarehouse: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Destination Location"
              value={form.destinationLocation}
              onChange={(e) =>
                setForm({
                  ...form,
                  destinationLocation: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <input
            type="number"
            placeholder={`Quantity (Max ${MAIN_STORAGE})`}
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
            style={inputStyle}
          />

          {qty > MAIN_STORAGE && (
            <div
              style={{
                color: "red",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              ❌ Insufficient Stock
            </div>
          )}

          <button
            onClick={createTransfer}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Create Transfer
          </button>
        </div>

        {/* VALIDATION CARD */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Stock Validation</h3>

          {latestTransfer ? (
            <>
              <h4>Before Transfer</h4>

              <p>Main Storage: {latestTransfer.beforeMain}</p>
              <p>
                Production Floor:{" "}
                {latestTransfer.beforeProduction}
              </p>

              <hr />

              <h4>Transfer Qty</h4>

              <p>{latestTransfer.quantity}</p>

              <hr />

              <h4>After Transfer</h4>

              <p>Main Storage: {latestTransfer.afterMain}</p>

              <p>
                Production Floor:{" "}
                {latestTransfer.afterProduction}
              </p>

              <p>
                Total Stock:{" "}
                {latestTransfer.afterMain +
                  latestTransfer.afterProduction}
              </p>

              <div
                style={{
                  marginTop: "15px",
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                ✅ Company stock remains unchanged
              </div>
            </>
          ) : (
            <>
              <p>Main Storage: {MAIN_STORAGE}</p>
              <p>Production Floor: {PRODUCTION_FLOOR}</p>
              <p>Total Stock: {MAIN_STORAGE + PRODUCTION_FLOOR}</p>

              <div
                style={{
                  marginTop: "15px",
                  color: "#666",
                }}
              >
                Create a transfer to see validation.
              </div>
            </>
          )}
        </div>
      </div>

      {/* HISTORY */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h3>Transfer History</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#2563eb",
                color: "#fff",
              }}
            >
              <th style={th}>Product</th>
              <th style={th}>From</th>
              <th style={th}>To</th>
              <th style={th}>Quantity</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id}>
                <td style={td}>{transfer.product}</td>

                <td style={td}>
                  {transfer.sourceWarehouse}
                  <br />
                  {transfer.sourceLocation}
                </td>

                <td style={td}>
                  {transfer.destinationWarehouse}
                  <br />
                  {transfer.destinationLocation}
                </td>

                <td style={td}>{transfer.quantity}</td>

                <td style={td}>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "6px 12px",
                      borderRadius: "20px",
                    }}
                  >
                    Ready
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transfers.length === 0 && (
          <p style={{ marginTop: "20px", color: "#666" }}>
            No transfers yet.
          </p>
        )}
      </div>
    </div>
  );
}

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const th = {
  padding: "14px",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #eee",
};