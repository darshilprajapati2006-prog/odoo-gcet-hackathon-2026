import { useState } from "react";

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);

  const addAdjustment = () => {
    setAdjustments([
      ...adjustments,
      {
        id: Date.now(),
        product: "Laptop",
        quantity: 5,
        reason: "Stock Count Correction",
      },
    ]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Inventory Adjustments</h1>

      <button onClick={addAdjustment}>
        Add Dummy Adjustment
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
            <th>Quantity</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          {adjustments.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>{item.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}