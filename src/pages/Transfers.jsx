import { useState } from "react";

export default function Transfers() {
  const sourceStock = 100;
  const destinationStock = 20;

  const [product, setProduct] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [sourceLocation, setSourceLocation] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [quantity, setQuantity] = useState("");

  const [transfers, setTransfers] = useState([]);

  const handleTransfer = () => {
    const qty = Number(quantity);

    if (
      !product ||
      !sourceWarehouse ||
      !sourceLocation ||
      !destinationWarehouse ||
      !destinationLocation ||
      !qty
    ) {
      alert("Fill all fields");
      return;
    }

    if (qty > sourceStock) {
      alert(
        `Insufficient Stock! Available stock is only ${sourceStock}`
      );
      return;
    }

    const newTransfer = {
      id: Date.now(),
      product,
      fromWarehouse: sourceWarehouse,
      fromLocation: sourceLocation,
      toWarehouse: destinationWarehouse,
      toLocation: destinationLocation,
      quantity: qty,
      status: "Ready",
    };

    setTransfers([newTransfer, ...transfers]);

    setProduct("");
    setSourceWarehouse("");
    setSourceLocation("");
    setDestinationWarehouse("");
    setDestinationLocation("");
    setQuantity("");
  };

  const qty = Number(quantity) || 0;

  const afterSource =
    qty <= sourceStock ? sourceStock - qty : sourceStock;

  const afterDestination =
    qty <= sourceStock
      ? destinationStock + qty
      : destinationStock;

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 25 }}>
        Internal Transfers
      </h1>

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
            padding: "25px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Create Transfer</h3>

          <input
            placeholder="Product"
            value={product}
            onChange={(e) =>
              setProduct(e.target.value)
            }
            style={inputStyle}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <input
              placeholder="Source Warehouse"
              value={sourceWarehouse}
              onChange={(e) =>
                setSourceWarehouse(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              placeholder="Source Location"
              value={sourceLocation}
              onChange={(e) =>
                setSourceLocation(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              placeholder="Destination Warehouse"
              value={destinationWarehouse}
              onChange={(e) =>
                setDestinationWarehouse(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              placeholder="Destination Location"
              value={destinationLocation}
              onChange={(e) =>
                setDestinationLocation(
                  e.target.value
                )
              }
              style={inputStyle}
            />
          </div>

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            style={inputStyle}
          />

          <button
            onClick={handleTransfer}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding:
                "12px 22px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Create Transfer
          </button>
        </div>

        {/* VALIDATION CARD */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Stock Validation</h3>

          <h4>Before Transfer</h4>

          <p>Main Storage: 100</p>
          <p>Production Floor: 20</p>
          <p>Total Stock: 120</p>

          <hr />

          <h4>Transfer Quantity</h4>

          <p>{qty || 0}</p>

          <hr />

          <h4>After Transfer</h4>

          <p>
            Main Storage: {afterSource}
          </p>

          <p>
            Production Floor:
            {afterDestination}
          </p>

          <p>Total Stock: 120</p>

          {qty > sourceStock ? (
            <p
              style={{
                color: "red",
                fontWeight: "bold",
              }}
            >
              ❌ Insufficient Stock
            </p>
          ) : (
            <p
              style={{
                color: "green",
                fontWeight: "bold",
              }}
            >
              ✅ Company stock remains
              unchanged
            </p>
          )}
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
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
                background:
                  "#2563eb",
                color: "white",
              }}
            >
              <th style={thStyle}>
                Product
              </th>
              <th style={thStyle}>
                From
              </th>
              <th style={thStyle}>
                To
              </th>
              <th style={thStyle}>
                Quantity
              </th>
              <th style={thStyle}>
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {transfers.map((t) => (
              <tr key={t.id}>
                <td style={tdStyle}>
                  {t.product}
                </td>

                <td style={tdStyle}>
                  {t.fromWarehouse}
                  <br />
                  {t.fromLocation}
                </td>

                <td style={tdStyle}>
                  {t.toWarehouse}
                  <br />
                  {t.toLocation}
                </td>

                <td style={tdStyle}>
                  {t.quantity}
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      background:
                        "#dcfce7",
                      color: "#166534",
                      padding:
                        "5px 10px",
                      borderRadius:
                        "20px",
                    }}
                  >
                    Ready
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const thStyle = {
  padding: "12px",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};