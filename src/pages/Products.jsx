import { useMemo, useState } from "react";
import ProductFilters from "../features/products/ProductFilters";
import ProductTable from "../features/products/ProductTable";
import ProductModal from "../features/products/ProductModal";

const initialProducts = [
  {
    id: 1,
    name: "Steel Rod",
    sku: "STL-001",
    category: "Raw Material",
    unit: "kg",
    stock: 100,
    reorderLevel: 20,
    isActive: true,
  },
  {
    id: 2,
    name: "Office Chair",
    sku: "CHR-001",
    category: "Furniture",
    unit: "pcs",
    stock: 8,
    reorderLevel: 10,
    isActive: true,
  },
  {
    id: 3,
    name: "Copper Wire",
    sku: "COP-001",
    category: "Raw Material",
    unit: "meter",
    stock: 0,
    reorderLevel: 15,
    isActive: true,
  },
  {
    id: 4,
    name: "Laptop",
    sku: "LAP-001",
    category: "Electronics",
    unit: "pcs",
    stock: 25,
    reorderLevel: 5,
    isActive: true,
  },
];

function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");
  const [productStatus, setProductStatus] = useState("Active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((product) => product.category))];
  }, [products]);

  const getStockStatus = (product) => {
    if (product.stock <= 0) {
      return "Out of Stock";
    }

    if (product.stock <= product.reorderLevel) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.sku.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || product.category === category;

      const status = getStockStatus(product);

      const matchesStockStatus =
        stockStatus === "All" || status === stockStatus;

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

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                ...productData,
              }
            : product
        )
      );
    } else {
      const newProduct = {
        id: Date.now(),
        ...productData,
        isActive: true,
      };

      setProducts((currentProducts) => [...currentProducts, newProduct]);
    }

    closeModal();
  };

  const handleDeactivate = (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product?"
    );

    if (!confirmed) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              isActive: false,
            }
          : product
      )
    );
  };

  const handleActivate = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              isActive: true,
            }
          : product
      )
    );
  };

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;

  const lowStockProducts = products.filter(
    (product) => getStockStatus(product) === "Low Stock"
  ).length;

  const outOfStockProducts = products.filter(
    (product) => getStockStatus(product) === "Out of Stock"
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

        <ProductTable
          products={filteredProducts}
          getStockStatus={getStockStatus}
          onEdit={openEditModal}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
        />
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        products={products}
      />
    </div>
  );
}

export default Products;