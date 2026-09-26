import { useState } from "react";

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Internal Transfers</h1>

      <button
        onClick={() =>
          setTransfers([
            ...transfers,
            {
              id: Date.now(),
              from: "Warehouse A",
              to: "Warehouse B",
              quantity: 10,
            },
          ])
        }
      >
        Add Dummy Transfer
      </button>

      <table
        border="1"
        cellPadding="10"
        style={{ marginTop: "20px", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>From</th>
            <th>To</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id}>
              <td>{transfer.id}</td>
              <td>{transfer.from}</td>
              <td>{transfer.to}</td>
              <td>{transfer.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}