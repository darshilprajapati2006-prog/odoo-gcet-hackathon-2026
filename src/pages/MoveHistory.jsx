import { useState, useEffect } from "react";

export default function MoveHistory() {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("");
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("moveHistory")) || [];

    setMovements(saved);
  }, []);

  const filteredMovements = movements.filter((m) => {
    const productMatch = (m.product || "")
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

  const getBadgeStyle = (type) => {
    switch (type) {
      case "TRANSFER_IN":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      case "TRANSFER_OUT":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };

      case "ADJUSTMENT":
        return {
          background: "#fef3c7",
          color: "#92400e",
        };

      case "RECEIPT":
        return {
          background: "#dbeafe",
          color: "#1e40af",
        };

      case "DELIVERY":
        return {
          background: "#ede9fe",
          color: "#5b21b6",
        };

      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
        };
    }
  };

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
          marginBottom: "25px",
          color: "#1f2937",
        }}
      >
        Stock Move History
      </h2>

      {/* SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={cardStyle}>
          <h4>Total Movements</h4>
          <h1>{movements.length}</h1>
        </div>

        <div style={cardStyle}>
          <h4>Total Stock In</h4>
          <h1 style={{ color: "green" }}>
            +{totalIn}
          </h1>
        </div>

        <div style={cardStyle}>
          <h4>Total Stock Out</h4>
          <h1 style={{ color: "red" }}>
            -{totalOut}
          </h1>
        </div>

        <div style={cardStyle}>
          <h4>Net Movement</h4>
          <h1>
            {totalIn - totalOut}
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

            <option value="TRANSFER_IN">
              TRANSFER_IN
            </option>

            <option value="TRANSFER_OUT">
              TRANSFER_OUT
            </option>

            <option value="ADJUSTMENT">
              ADJUSTMENT
            </option>

            <option value="RECEIPT">
              RECEIPT
            </option>

            <option value="DELIVERY">
              DELIVERY
            </option>
          </select>
        </div>
      </div>

      {/* RECENT ACTIVITY */}

      <div
        style={{
          ...cardStyle,
          marginTop: "20px",
        }}
      >
        <h3>Recent Activity</h3>

        {movements.slice(0, 5).map((item) => (
          <div
            key={item.id}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <strong>{item.type}</strong>

            <div>{item.product}</div>

            <div
              style={{
                color:
                  item.quantity > 0
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              {item.quantity > 0
                ? `+${item.quantity}`
                : item.quantity}
            </div>
          </div>
        ))}

        {movements.length === 0 && (
          <p>No recent activity.</p>
        )}
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
                <td style={tdStyle}>
                  {move.date}
                </td>

                <td style={tdStyle}>
                  {move.product}
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      ...getBadgeStyle(move.type),
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
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
                      fontWeight: "bold",
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