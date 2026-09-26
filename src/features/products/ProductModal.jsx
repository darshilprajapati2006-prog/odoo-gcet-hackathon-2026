import ProductForm from "./ProductForm";

function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  products,
  categories,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProduct ? "Edit Product" : "Create Product"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <ProductForm
            onSave={onSave}
            onClose={onClose}
            editingProduct={editingProduct}
            products={products}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductModal;