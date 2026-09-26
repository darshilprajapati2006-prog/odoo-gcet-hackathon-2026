import { useEffect, useState } from "react";

function ProductForm({
  onSave,
  onClose,
  editingProduct,
  products,
  categories,
}) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    unit: "",
    reorderLevel: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        sku: editingProduct.sku || "",
        category_id: editingProduct.category_id || "",
        unit: editingProduct.unit || "",
        reorderLevel: editingProduct.reorderLevel ?? "",
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        category_id: "",
        unit: "",
        reorderLevel: "",
      });
    }

    setErrors({});
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const sku = formData.sku.trim();
    const unit = formData.unit.trim();

    if (!name) {
      newErrors.name = "Product name is required.";
    }

    if (!sku) {
      newErrors.sku = "SKU/Code is required.";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required.";
    }

    if (!unit) {
      newErrors.unit = "Unit of Measure is required.";
    }

    if (formData.reorderLevel === "") {
      newErrors.reorderLevel = "Reorder level is required.";
    } else if (Number(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = "Reorder level cannot be negative.";
    }

    const duplicateSku = products.some(
      (product) =>
        product.sku.toLowerCase() === sku.toLowerCase() &&
        product.id !== editingProduct?.id,
    );

    if (duplicateSku) {
      newErrors.sku = "SKU already exists. Please use a unique SKU.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSave({
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category_id: formData.category_id,
      unit: formData.unit.trim(),
      reorderLevel: Number(formData.reorderLevel),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Product Name *
        </label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
          className={`w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          SKU / Code *
        </label>

        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Enter SKU"
          className={`w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500 ${
            errors.sku ? "border-red-500" : "border-gray-300"
          }`}
        />

        {errors.sku && (
          <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Category *
          </label>

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-blue-500 ${
              errors.category_id ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {errors.category_id && (
            <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Unit of Measure *
          </label>

          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g. kg, pcs, meter"
            className={`w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500 ${
              errors.unit ? "border-red-500" : "border-gray-300"
            }`}
          />

          {errors.unit && (
            <p className="mt-1 text-sm text-red-500">{errors.unit}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Reorder Level
          </label>

          <input
            type="number"
            min="0"
            name="reorderLevel"
            value={formData.reorderLevel}
            onChange={handleChange}
            placeholder="0"
            className={`w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500 ${
              errors.reorderLevel ? "border-red-500" : "border-gray-300"
            }`}
          />

          {errors.reorderLevel && (
            <p className="mt-1 text-sm text-red-500">{errors.reorderLevel}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          {editingProduct ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
