import { useEffect, useMemo, useState } from "react";

export default function MoveHistory() {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("");
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    const transferData =
      JSON.parse(localStorage.getItem("transfers")) || [];

    const adjustmentData =
      JSON.parse(localStorage.getItem("adjustments")) || [];

    const transferMoves = transferData.flatMap((t) => [
      {
        id: `${t.id}-out`,
        date: t.date || new Date().toLocaleDateString(),
        product: t.product,
        type: "TRANSFER_OUT",
        quantity: -Number(t.quantity),
        warehouse: t.sourceWarehouse,
        location: t.sourceLocation,
        reference: `TRF-${t.id}`,
        user: "Admin",
      },
      {
        id: `${t.id}-in`,
        date: t.date || new Date().toLocaleDateString(),
        product: t.product,
        type: "TRANSFER_IN",
        quantity: Number(t.quantity),
        warehouse: t.destinationWarehouse,
        location: t.destinationLocation,
        reference: `TRF-${t.id}`,
        user: "Admin",
      },
    ]);

    const adjustmentMoves = adjustmentData.map((a) => ({
      id: a.id,
      date: a.date || new Date().toLocaleDateString(),
      product: a.product,
      type: "ADJUSTMENT",
      quantity: Number(a.difference),
      warehouse: a.warehouse,
      location: a.location,
      reference: `ADJ-${a.id}`,
      user: "Admin",
    }));

    const allMovements = [
      ...transferMoves,
      ...adjustmentMoves,
    ].sort((a, b) => b.id - a.id);

    setMovements(allMovements);
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const productMatch = m.product
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const typeMatch =
        movementType === "" || m.type === movementType;

      return productMatch && typeMatch;
    });
  }, [movements, search, movementType]);

  const totalIn = movements
    .filter((m) => m.quantity > 0)
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalOut = Math.abs(
    movements
      .filter((m) => m.quantity < 0)
      .reduce((sum, m) => sum + m.quantity, 0)
  );

  const netMovement = totalIn - totalOut;

  return (
    <div
      style={{
        padding: "30px",
        background: "#f3f6fb",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          marginBottom: "25px",
          color: "#111827",
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
        <SummaryCard
          title="Total Movements"
          value={movements.length}
        />

        <SummaryCard
          title="Total Stock In"
          value={`+${totalIn}`}
          color="green"
        />

        <SummaryCard
          title="Total Stock Out"
          value={`-${totalOut}`}
          color="red"
        />

        <SummaryCard
          title="Net Movement"
          value={netMovement}
          color="#2563eb"
        />
      </div>

      {/* FILTERS */}
      <div style={card}>
        <h3 style={{ marginBottom: 18 }}>
          Filters
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "15px",
          }}
        >
          <input
            placeholder="Search Product"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={input}
          />

          <select
            value={movementType}
            onChange={(e) =>
              setMovementType(e.target.value)
            }
            style={input}
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
          </select>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div
        style={{
          ...card,
          marginTop: 25,
        }}
      >
        <h3>Recent Activity</h3>

        {movements.length === 0 ? (
          <p>No recent activity.</p>
        ) : (
          <div
            style={{
              marginTop: 15,
            }}
          >
            {movements.slice(0, 5).map((m) => (
              <div
                key={m.id}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    "1px solid #e5e7eb",
                }}
              >
                <strong>{m.product}</strong>{" "}
                {m.type} (
                <span
                  style={{
                    color:
                      m.quantity > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {m.quantity > 0
                    ? `+${m.quantity}`
                    : m.quantity}
                </span>
                )
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div
        style={{
          ...card,
          marginTop: "25px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>
          Stock Ledger
        </h3>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#2563eb",
                  color: "#fff",
                }}
              >
                <th style={th}>Date</th>
                <th style={th}>Product</th>
                <th style={th}>Type</th>
                <th style={th}>Quantity</th>
                <th style={th}>Warehouse</th>
                <th style={th}>Location</th>
                <th style={th}>Reference</th>
                <th style={th}>User</th>
              </tr>
            </thead>

            <tbody>
              {filteredMovements.map(
                (move) => (
                  <tr key={move.id}>
                    <td style={td}>
                      {move.date}
                    </td>

                    <td style={td}>
                      {move.product}
                    </td>

                    <td style={td}>
                      <span
                        style={{
                          padding:
                            "6px 12px",
                          borderRadius:
                            "20px",
                          background:
                            "#eef2ff",
                          fontSize:
                            "13px",
                        }}
                      >
                        {move.type}
                      </span>
                    </td>

                    <td style={td}>
                      <span
                        style={{
                          color:
                            move.quantity >
                            0
                              ? "green"
                              : "red",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {move.quantity >
                        0
                          ? `+${move.quantity}`
                          : move.quantity}
                      </span>
                    </td>

                    <td style={td}>
                      {move.warehouse}
                    </td>

                    <td style={td}>
                      {move.location}
                    </td>

                    <td style={td}>
                      {move.reference}
                    </td>

                    <td style={td}>
                      {move.user}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {filteredMovements.length ===
          0 && (
          <p
            style={{
              marginTop: 20,
              textAlign:
                "center",
            }}
          >
            No movement found
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color = "#111827",
}) {
  return (
    <div style={card}>
      <div
        style={{
          color: "#6b7280",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <h1
        style={{
          margin: 0,
          color,
        }}
      >
        {value}
      </h1>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: "22px",
  borderRadius: "18px",
  boxShadow:
    "0 2px 12px rgba(0,0,0,0.06)",
};

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
};

const th = {
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
};