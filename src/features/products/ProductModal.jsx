import ProductForm from "./ProductForm";

function ProductModal({
  isOpen,
  onClose,
  onSave,
  saving,
  editingProduct,
  products,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2
              id="product-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {editingProduct ? "Edit product" : "Add a product"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Catalog details and reorder settings.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product form"
            className="grid h-9 w-9 place-items-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <ProductForm
            onSave={onSave}
            saving={saving}
            onClose={onClose}
            editingProduct={editingProduct}
            products={products}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            onRetryCategories={onRetryCategories}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
