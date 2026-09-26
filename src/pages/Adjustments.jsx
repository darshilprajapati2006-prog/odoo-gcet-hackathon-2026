import { useState } from "react";

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);

  const [form, setForm] = useState({
    product: "",
    warehouse: "",
    location: "",
    countedQty: "",
    reason: "",
  });

  // Demo system stock
  const SYSTEM_QTY = 100;

  const countedQty = Number(form.countedQty) || 0;
  const difference = countedQty - SYSTEM_QTY;

  const createAdjustment = () => {
    if (
      !form.product ||
      !form.warehouse ||
      !form.location ||
      !form.countedQty ||
      !form.reason
    ) {
      alert("Please fill all fields");
      return;
    }

    const newAdjustment = {
      id: Date.now(),
      ...form,
      systemQty: SYSTEM_QTY,
      countedQty,
      difference,
      finalQty: countedQty,
      status: "Validated",
    };

    setAdjustments([newAdjustment, ...adjustments]);

    setForm({
      product: "",
      warehouse: "",
      location: "",
      countedQty: "",
      reason: "",
    });
  };

  const latestAdjustment = adjustments[0];

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
        Inventory Adjustments
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {/* FORM */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Create Adjustment</h3>

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

          <div style={rowStyle}>
            <input
              placeholder="Warehouse"
              value={form.warehouse}
              onChange={(e) =>
                setForm({
                  ...form,
                  warehouse: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          {/* AUTO SYSTEM QTY */}
          <input
            value={`System Quantity: ${SYSTEM_QTY}`}
            readOnly
            style={{
              ...inputStyle,
              background: "#f3f4f6",
              fontWeight: "bold",
            }}
          />

          <input
            type="number"
            placeholder="Counted Quantity"
            value={form.countedQty}
            onChange={(e) =>
              setForm({
                ...form,
                countedQty: e.target.value,
              })
            }
            style={inputStyle}
          />

          <input
            placeholder="Reason"
            value={form.reason}
            onChange={(e) =>
              setForm({
                ...form,
                reason: e.target.value,
              })
            }
            style={inputStyle}
          />

          <button
            onClick={createAdjustment}
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
            Validate Adjustment
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
          <h3>Adjustment Validation</h3>

          {latestAdjustment ? (
            <>
              <h4>Before</h4>

              <p>System Quantity: {latestAdjustment.systemQty}</p>

              <hr />

              <h4>Counted Quantity</h4>

              <p>{latestAdjustment.countedQty}</p>

              <hr />

              <h4>Difference</h4>

              <p
                style={{
                  color:
                    latestAdjustment.difference < 0
                      ? "red"
                      : "green",
                  fontWeight: "bold",
                }}
              >
                {latestAdjustment.difference > 0 ? "+" : ""}
                {latestAdjustment.difference}
              </p>

              <hr />

              <h4>Final Stock</h4>

              <p>
                {latestAdjustment.systemQty} →{" "}
                {latestAdjustment.finalQty}
              </p>

              <div
                style={{
                  marginTop: "15px",
                  color: "#2563eb",
                  fontWeight: "bold",
                }}
              >
                Ledger Entry Created
              </div>
            </>
          ) : (
            <>
              <p>System Quantity: {SYSTEM_QTY}</p>
              <p>Counted Quantity: -</p>
              <p>Difference: -</p>

              <div
                style={{
                  marginTop: "15px",
                  color: "#666",
                }}
              >
                Create adjustment to see validation.
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
        <h3>Adjustment History</h3>

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
              <th style={th}>Warehouse</th>
              <th style={th}>System</th>
              <th style={th}>Counted</th>
              <th style={th}>Difference</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {adjustments.map((item) => (
              <tr key={item.id}>
                <td style={td}>{item.product}</td>

                <td style={td}>
                  {item.warehouse}
                  <br />
                  {item.location}
                </td>

                <td style={td}>{item.systemQty}</td>

                <td style={td}>{item.countedQty}</td>

                <td
                  style={{
                    ...td,
                    color:
                      item.difference < 0
                        ? "red"
                        : "green",
                    fontWeight: "bold",
                  }}
                >
                  {item.difference > 0 ? "+" : ""}
                  {item.difference}
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
                    Validated
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {adjustments.length === 0 && (
          <p
            style={{
              marginTop: "20px",
              color: "#666",
            }}
          >
            No adjustments yet.
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