import { useState } from "react";

export default function Transfers() {
  const [transfers, setTransfers] = useState(() => {
    return JSON.parse(localStorage.getItem("transfers")) || [];
  });

  const [form, setForm] = useState({
    product: "",
    sourceWarehouse: "",
    sourceLocation: "",
    destinationWarehouse: "",
    destinationLocation: "",
    quantity: "",
  });

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
      status: "Completed",
      beforeMain: MAIN_STORAGE,
      beforeProduction: PRODUCTION_FLOOR,
      afterMain,
      afterProduction,
      createdAt: new Date().toLocaleString(),
    };

    const updatedTransfers = [newTransfer, ...transfers];

    setTransfers(updatedTransfers);

    localStorage.setItem(
      "transfers",
      JSON.stringify(updatedTransfers)
    );

    const history =
      JSON.parse(localStorage.getItem("moveHistory")) || [];

    const ref = `TRF-${Date.now()}`;

    history.unshift({
      id: Date.now(),
      date: new Date().toLocaleString(),
      product: form.product,
      type: "TRANSFER_OUT",
      quantity: -qty,
      warehouse: form.sourceWarehouse,
      location: form.sourceLocation,
      reference: ref,
      user: "Admin",
    });

    history.unshift({
      id: Date.now() + 1,
      date: new Date().toLocaleString(),
      product: form.product,
      type: "TRANSFER_IN",
      quantity: qty,
      warehouse: form.destinationWarehouse,
      location: form.destinationLocation,
      reference: ref,
      user: "Admin",
    });

    localStorage.setItem(
      "moveHistory",
      JSON.stringify(history)
    );

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

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div style={summaryCard}>
          <h4>Total Transfers</h4>
          <h2>{transfers.length}</h2>
        </div>

        <div style={summaryCard}>
          <h4>Main Storage</h4>
          <h2>{MAIN_STORAGE}</h2>
        </div>

        <div style={summaryCard}>
          <h4>Production Floor</h4>
          <h2>{PRODUCTION_FLOOR}</h2>
        </div>

        <div style={summaryCard}>
          <h4>Total Stock</h4>
          <h2>{MAIN_STORAGE + PRODUCTION_FLOOR}</h2>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={card}>
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
            style={buttonStyle}
          >
            Create Transfer
          </button>
        </div>

        <div style={card}>
          <h3>Stock Validation</h3>

          {latestTransfer ? (
            <>
              <p>
                Before Main Storage:
                {latestTransfer.beforeMain}
              </p>

              <p>
                Before Production:
                {latestTransfer.beforeProduction}
              </p>

              <hr />

              <p>
                Transfer Qty:
                {latestTransfer.quantity}
              </p>

              <hr />

              <p>
                After Main Storage:
                {latestTransfer.afterMain}
              </p>

              <p>
                After Production:
                {latestTransfer.afterProduction}
              </p>

              <p>
                Total Stock:
                {latestTransfer.afterMain +
                  latestTransfer.afterProduction}
              </p>

              <div
                style={{
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                ✅ Company stock unchanged
              </div>
            </>
          ) : (
            <p>Create a transfer to see validation</p>
          )}
        </div>
      </div>

      <div style={card}>
        <h3>Transfer History</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#2563eb",
                color: "white",
              }}
            >
              <th style={th}>Date</th>
              <th style={th}>Product</th>
              <th style={th}>From</th>
              <th style={th}>To</th>
              <th style={th}>Qty</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id}>
                <td style={td}>{transfer.createdAt}</td>

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
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transfers.length === 0 && (
          <p>No transfers yet.</p>
        )}
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: "16px",
  padding: "25px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const summaryCard = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

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

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const th = {
  padding: "14px",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #eee",
};