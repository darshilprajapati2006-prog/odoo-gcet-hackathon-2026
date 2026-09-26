import { useCallback, useEffect, useMemo, useState } from "react";
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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");
  const [productStatus, setProductStatus] = useState("Active");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategoryOptions(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load categories.");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
      setError("");

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Product Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage products, stock levels and reorder levels
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Active Products</p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {activeProducts}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Low Stock</p>

            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {lowStockProducts}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Out of Stock</p>

            <p className="mt-1 text-2xl font-bold text-red-600">
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
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500 shadow-sm">
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
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        products={products}
        categories={categoryOptions}
      />
    </div>
  );
}

export default Products;
