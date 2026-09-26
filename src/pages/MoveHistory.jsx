import { useState } from "react";

export default function MoveHistory() {
  const [moves, setMoves] = useState([]);

  const addMove = () => {
    setMoves([
      ...moves,
      {
        id: Date.now(),
        product: "Laptop",
        from: "Warehouse A",
        to: "Warehouse B",
        quantity: 10,
      },
    ]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Stock Move History</h1>

      <button onClick={addMove}>
        Add Dummy Move
      </button>

      <table
        border="1"
        cellPadding="10"
        style={{ marginTop: "20px", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>From</th>
            <th>To</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {moves.map((move) => (
            <tr key={move.id}>
              <td>{move.id}</td>
              <td>{move.product}</td>
              <td>{move.from}</td>
              <td>{move.to}</td>
              <td>{move.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}