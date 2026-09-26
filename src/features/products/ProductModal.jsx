import ProductForm from "./ProductForm";

function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  products,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Create Product"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingProduct
                ? "Update product information"
                : "Add a new product"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
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
          />
        </div>
      </div>
    </div>
  );
}

export default ProductModal;