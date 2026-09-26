import { useState } from "react";

export default function Transfers() {
  const [product, setProduct] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [sourceLocation, setSourceLocation] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [quantity, setQuantity] = useState("");

  const [status, setStatus] = useState("Draft");
  const [error, setError] = useState("");

  const [transfers, setTransfers] = useState([]);

  // Demo stock values
  const sourceStock = 100;
  const destinationStock = 20;

  const handleTransfer = () => {
    setError("");

    if (
      !product ||
      !sourceWarehouse ||
      !sourceLocation ||
      !destinationWarehouse ||
      !destinationLocation ||
      !quantity
    ) {
      setError("Please fill all fields");
      return;
    }

    if (Number(quantity) > sourceStock) {
      setError("Insufficient Stock");
      return;
    }

    const newTransfer = {
      id: Date.now(),
      product,
      from: sourceWarehouse,
      fromLocation: sourceLocation,
      to: destinationWarehouse,
      toLocation: destinationLocation,
      quantity: Number(quantity),
      status: "Ready",
    };

    setTransfers([...transfers, newTransfer]);
    setStatus("Ready");

    // Clear form
    setProduct("");
    setSourceWarehouse("");
    setSourceLocation("");
    setDestinationWarehouse("");
    setDestinationLocation("");
    setQuantity("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Internal Transfers</h1>

      <h3>Status: {status}</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "500px",
        }}
      >
        <input
          placeholder="Product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />

        <input
          placeholder="Source Warehouse"
          value={sourceWarehouse}
          onChange={(e) => setSourceWarehouse(e.target.value)}
        />

        <input
          placeholder="Source Location"
          value={sourceLocation}
          onChange={(e) => setSourceLocation(e.target.value)}
        />

        <input
          placeholder="Destination Warehouse"
          value={destinationWarehouse}
          onChange={(e) => setDestinationWarehouse(e.target.value)}
        />

        <input
          placeholder="Destination Location"
          value={destinationLocation}
          onChange={(e) => setDestinationLocation(e.target.value)}
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <button onClick={handleTransfer}>
          Create Transfer
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Stock Validation Demo</h3>

        <p>Main Storage: {sourceStock}</p>
        <p>Production Floor: {destinationStock}</p>

        {quantity && !error && (
          <>
            <hr />

            <p>
              After Transfer:
            </p>

            <p>
              Main Storage:{" "}
              {sourceStock - Number(quantity || 0)}
            </p>

            <p>
              Production Floor:{" "}
              {destinationStock + Number(quantity || 0)}
            </p>

            <p>
              Total Stock:{" "}
              {sourceStock + destinationStock}
            </p>
          </>
        )}
      </div>

      <table
        border="1"
        cellPadding="10"
        style={{
          marginTop: "20px",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>From</th>
            <th>To</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id}>
              <td>{transfer.id}</td>
              <td>{transfer.product}</td>
              <td>
                {transfer.from}
                <br />
                {transfer.fromLocation}
              </td>
              <td>
                {transfer.to}
                <br />
                {transfer.toLocation}
              </td>
              <td>{transfer.quantity}</td>
              <td>{transfer.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}