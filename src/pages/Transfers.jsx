import { useState } from "react";

export default function Transfers() {
  const [product, setProduct] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [sourceLocation, setSourceLocation] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [quantity, setQuantity] = useState("");

  const [transfers, setTransfers] = useState([]);

  const handleTransfer = () => {
    if (
      !product ||
      !sourceWarehouse ||
      !sourceLocation ||
      !destinationWarehouse ||
      !destinationLocation ||
      !quantity
    ) {
      alert("Please fill all fields");
      return;
    }

    const newTransfer = {
      id: Date.now(),
      product,
      from: sourceLocation,
      to: destinationLocation,
      quantity,
      status: "Ready",
    };

    setTransfers([...transfers, newTransfer]);

    setProduct("");
    setSourceWarehouse("");
    setSourceLocation("");
    setDestinationWarehouse("");
    setDestinationLocation("");
    setQuantity("");
  };

  return (
    <div style={{ padding: "25px" }}>
      <h1 style={{ marginBottom: "20px" }}>Internal Transfers</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* Transfer Form */}

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Create Transfer</h2>

          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Product"
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
              placeholder="Source Warehouse"
              style={inputStyle}
            />

            <input
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              placeholder="Source Location"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={destinationWarehouse}
              onChange={(e) => setDestinationWarehouse(e.target.value)}
              placeholder="Destination Warehouse"
              style={inputStyle}
            />

            <input
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value)}
              placeholder="Destination Location"
              style={inputStyle}
            />
          </div>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            style={inputStyle}
          />

          <button
            onClick={handleTransfer}
            style={{
              marginTop: "15px",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Create Transfer
          </button>
        </div>

        {/* Stock Validation */}

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Stock Validation</h2>

          <p>Main Storage: 100</p>
          <p>Production Floor: 20</p>

          <hr />

          <h3>Total Stock: 120</h3>

          <p style={{ color: "green" }}>
            ✓ Company stock remains unchanged
          </p>
        </div>
      </div>

      {/* Transfer History */}

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Transfer History</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr style={{ background: "#2563eb", color: "white" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>From</th>
              <th style={thStyle}>To</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id}>
                <td style={tdStyle}>{transfer.id}</td>
                <td style={tdStyle}>{transfer.product}</td>
                <td style={tdStyle}>{transfer.from}</td>
                <td style={tdStyle}>{transfer.to}</td>
                <td style={tdStyle}>{transfer.quantity}</td>
                <td style={tdStyle}>{transfer.status}</td>
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
  padding: "10px",
  marginTop: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

const thStyle = {
  padding: "12px",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};