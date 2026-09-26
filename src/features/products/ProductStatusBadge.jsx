function ProductStatusBadge({ stock, reorderLevel }) {
  let status = "In Stock";

  if (stock <= 0) {
    status = "Out of Stock";
  } else if (stock <= reorderLevel) {
    status = "Low Stock";
  }

  const styles = {
    "In Stock": "bg-green-100 text-green-700",
    "Low Stock": "bg-yellow-100 text-yellow-700",
    "Out of Stock": "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default ProductStatusBadge;