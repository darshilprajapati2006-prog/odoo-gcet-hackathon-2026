import { useState } from "react";

export default function MoveHistory() {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("");

  const movements = [
    {
      id: 1,
      date: "2026-09-26",
      product: "Steel Rod",
      type: "RECEIPT",
      quantity: 100,
      warehouse: "Main Warehouse",
      location: "Main Storage",
      reference: "RCPT-001",
      user: "Admin",
    },
    {
      id: 2,
      date: "2026-09-26",
      product: "Steel Rod",
      type: "TRANSFER_OUT",
      quantity: -30,
      warehouse: "Main Warehouse",
      location: "Main Storage",
      reference: "TRF-001",
      user: "Admin",
    },
    {
      id: 3,
      date: "2026-09-26",
      product: "Steel Rod",
      type: "TRANSFER_IN",
      quantity: 30,
      warehouse: "Main Warehouse",
      location: "Production Floor",
      reference: "TRF-001",
      user: "Admin",
    },
    {
      id: 4,
      date: "2026-09-26",
      product: "Steel Rod",
      type: "ADJUSTMENT",
      quantity: -3,
      warehouse: "Main Warehouse",
      location: "Production Floor",
      reference: "ADJ-001",
      user: "Admin",
    },
    {
      id: 5,
      date: "2026-09-26",
      product: "Steel Rod",
      type: "DELIVERY",
      quantity: -10,
      warehouse: "Main Warehouse",
      location: "Dispatch Area",
      reference: "DEL-001",
      user: "Admin",
    },
  ];

  const filteredMovements = movements.filter((m) => {
    const productMatch = m.product
      .toLowerCase()
      .includes(search.toLowerCase());

    const typeMatch =
      movementType === "" || m.type === movementType;

    return productMatch && typeMatch;
  });

  const totalIn = movements
    .filter((m) => m.quantity > 0)
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalOut = Math.abs(
    movements
      .filter((m) => m.quantity < 0)
      .reduce((sum, m) => sum + m.quantity, 0)
  );

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ marginBottom: "25px" }}>
        Stock Move History
      </h2>

      {/* SUMMARY CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={cardStyle}>
          <h3>Total Movements</h3>
          <h1>{movements.length}</h1>
        </div>

        <div style={cardStyle}>
          <h3>Total Stock In</h3>
          <h1 style={{ color: "green" }}>
            +{totalIn}
          </h1>
        </div>

        <div style={cardStyle}>
          <h3>Total Stock Out</h3>
          <h1 style={{ color: "red" }}>
            -{totalOut}
          </h1>
        </div>
      </div>

      {/* FILTERS */}

      <div style={cardStyle}>
        <h3 style={{ marginBottom: "15px" }}>
          Filters
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "12px",
          }}
        >
          <input
            placeholder="Search Product"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={inputStyle}
          />

          <select
            value={movementType}
            onChange={(e) =>
              setMovementType(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              All Movement Types
            </option>

            <option value="RECEIPT">
              RECEIPT
            </option>

            <option value="DELIVERY">
              DELIVERY
            </option>

            <option value="TRANSFER_IN">
              TRANSFER_IN
            </option>

            <option value="TRANSFER_OUT">
              TRANSFER_OUT
            </option>

            <option value="ADJUSTMENT">
              ADJUSTMENT
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div
        style={{
          ...cardStyle,
          marginTop: "25px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>
          Stock Ledger
        </h3>

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
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Warehouse</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Reference</th>
              <th style={thStyle}>User</th>
            </tr>
          </thead>

          <tbody>
            {filteredMovements.map((move) => (
              <tr key={move.id}>
                <td style={tdStyle}>{move.date}</td>

                <td style={tdStyle}>
                  {move.product}
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      padding:
                        "6px 12px",
                      borderRadius:
                        "20px",
                      background:
                        "#eef2ff",
                    }}
                  >
                    {move.type}
                  </span>
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      color:
                        move.quantity > 0
                          ? "green"
                          : "red",
                      fontWeight:
                        "bold",
                    }}
                  >
                    {move.quantity > 0
                      ? `+${move.quantity}`
                      : move.quantity}
                  </span>
                </td>

                <td style={tdStyle}>
                  {move.warehouse}
                </td>

                <td style={tdStyle}>
                  {move.location}
                </td>

                <td style={tdStyle}>
                  {move.reference}
                </td>

                <td style={tdStyle}>
                  {move.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMovements.length === 0 && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            No movement found
          </p>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const thStyle = {
  padding: "14px",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};