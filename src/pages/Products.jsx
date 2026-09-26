import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import ProductFilters from "../features/products/ProductFilters";
import ProductTable from "../features/products/ProductTable";
import ProductModal from "../features/products/ProductModal";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deactivateProduct,
} from "../services/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");
  const [productStatus, setProductStatus] = useState("Active");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      const formattedProducts = data.map((product) => {
        const categoryData = categoryOptions.find(
          (item) => item.id === product.category_id,
        );

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category:
            categoryData?.name || product.category_id || "Uncategorized",
          category_id: product.category_id,
          unit: product.unit_of_measure,
          stock: Number(product.total_stock || 0),
          reorderLevel: Number(product.reorder_level || 0),
          isActive: product.is_active,
        };
      });

      setProducts(formattedProducts);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [categoryOptions]);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");
      const data = await getCategories();
      setCategoryOptions(data);
    } catch (err) {
      console.error("Category loading error:", err);
      setCategoriesError(
        "Unable to load categories. Please refresh and try again.",
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getStockStatus = (product) => {
    if (product.stock <= 0) return "Out of Stock";
    if (product.stock <= product.reorderLevel) return "Low Stock";
    return "In Stock";
  };

  const categories = useMemo(() => {
    return ["All", ...categoryOptions.map((item) => item.name)];
  }, [categoryOptions]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.sku.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || product.category === category;

      const currentStockStatus = getStockStatus(product);

      const matchesStockStatus =
        stockStatus === "All" || currentStockStatus === stockStatus;

      const matchesProductStatus =
        productStatus === "All" ||
        (productStatus === "Active" && product.isActive) ||
        (productStatus === "Inactive" && !product.isActive);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStockStatus &&
        matchesProductStatus
      );
    });
  }, [products, search, category, stockStatus, productStatus]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      setSavingProduct(true);
      setError("");
      setSuccess("");

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: productData.name,
          sku: productData.sku,
          category_id: productData.category_id,
          unit_of_measure: productData.unit,
          reorder_level: productData.reorderLevel,
        });
      } else {
        await createProduct({
          name: productData.name,
          sku: productData.sku,
          category_id: productData.category_id,
          unit_of_measure: productData.unit,
          reorder_level: productData.reorderLevel,
        });
      }

      await loadProducts();
      closeModal();
      setSuccess(
        editingProduct
          ? "Product updated successfully."
          : "Product created successfully.",
      );
    } catch (err) {
      console.error(err);

      if (
        err.code === "23505" ||
        err.message?.toLowerCase().includes("duplicate")
      ) {
        setError("SKU already exists. Please use a unique SKU.");
      } else {
        setError(err.message || "Failed to save product.");
      }
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeactivate = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product?",
    );

    if (!confirmed) return;

    try {
      setError("");
      await deactivateProduct(productId);
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to deactivate product.");
    }
  };

  const handleActivate = async (productId) => {
    try {
      setError("");

      await updateProduct(productId, {
        is_active: true,
      });

      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to activate product.");
    }
  };

  const totalProducts = products.length;

  const activeProducts = products.filter((product) => product.isActive).length;

  const lowStockProducts = products.filter(
    (product) => getStockStatus(product) === "Low Stock",
  ).length;

  const outOfStockProducts = products.filter(
    (product) => getStockStatus(product) === "Out of Stock",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
            Inventory catalog
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage products, SKUs, stock levels, and reorder thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <Plus size={17} /> Add Product
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">Total Products</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {totalProducts.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">Active Products</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">
            {activeProducts}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">Low Stock</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-amber-700">
            {lowStockProducts}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">Out of Stock</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-red-700">
            {outOfStockProducts}
          </p>
        </div>
      </div>

      <ProductFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        stockStatus={stockStatus}
        setStockStatus={setStockStatus}
        productStatus={productStatus}
        setProductStatus={setProductStatus}
        categories={categories}
      />

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          <span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          Loading products...
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={openEditModal}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
        />
      )}
      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSaveProduct}
        saving={savingProduct}
        editingProduct={editingProduct}
        products={products}
        categories={categoryOptions}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={loadCategories}
      />
    </div>
  );
}

export default Products;
