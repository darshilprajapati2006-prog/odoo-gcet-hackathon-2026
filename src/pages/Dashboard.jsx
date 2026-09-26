import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CheckCircle2,
  Package,
  RefreshCw,
  Search,
  Warehouse,
} from "lucide-react";

import { supabase } from "../services/supabase";

const DOCUMENT_TYPES = [
  { value: "all", label: "All Documents" },
  { value: "receipt", label: "Receipts" },
  { value: "delivery", label: "Delivery Orders" },
  { value: "transfer", label: "Internal Transfers" },
  { value: "adjustment", label: "Adjustments" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "waiting", label: "Waiting" },
  { value: "ready", label: "Ready" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
];

const MOVEMENT_LABELS = {
  receipt: "Receipt",
  delivery: "Delivery",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  adjustment: "Adjustment",
};

const MOVEMENT_STYLES = {
  receipt: {
    icon: ArrowDownToLine,
    badge: "bg-emerald-100 text-emerald-700",
  },
  delivery: {
    icon: ArrowUpFromLine,
    badge: "bg-red-100 text-red-700",
  },
  transfer_in: {
    icon: ArrowLeftRight,
    badge: "bg-blue-100 text-blue-700",
  },
  transfer_out: {
    icon: ArrowLeftRight,
    badge: "bg-orange-100 text-orange-700",
  },
  adjustment: {
    icon: RefreshCw,
    badge: "bg-purple-100 text-purple-700",
  },
};

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  if (!status) return "-";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadge(status) {
  const styles = {
    draft: "bg-slate-100 text-slate-700",
    waiting: "bg-amber-100 text-amber-700",
    ready: "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
    canceled: "bg-red-100 text-red-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);
  const [stockByLocation, setStockByLocation] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);

  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [documentType, setDocumentType] = useState("all");
  const [status, setStatus] = useState("all");
  const [warehouseId, setWarehouseId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsResult,
        categoriesResult,
        warehousesResult,
        stockSummaryResult,
        stockByLocationResult,
        movementsResult,
        receiptsResult,
        deliveriesResult,
        transfersResult,
        adjustmentsResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, sku, category_id, reorder_level, is_active")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("categories")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("warehouses")
          .select("id, name, code, is_active")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("product_stock_summary")
          .select("product_id, total_stock"),

        supabase
          .from("product_stock_by_location")
          .select("product_id, warehouse_id, stock_quantity"),

        supabase
          .from("move_history")
          .select(
            "id, product_id, warehouse_id, movement_type, quantity, created_at, product_name, sku, warehouse_name",
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("receipts")
          .select("id, warehouse_id, status, created_at"),

        supabase
          .from("deliveries")
          .select("id, warehouse_id, status, created_at"),

        supabase
          .from("transfers")
          .select(
            "id, source_warehouse_id, destination_warehouse_id, status, created_at",
          ),

        supabase
          .from("stock_adjustments")
          .select("id, warehouse_id, status, created_at"),
      ]);

      const results = [
        productsResult,
        categoriesResult,
        warehousesResult,
        stockSummaryResult,
        stockByLocationResult,
        movementsResult,
        receiptsResult,
        deliveriesResult,
        transfersResult,
        adjustmentsResult,
      ];

      const failed = results.find((result) => result.error);

      if (failed) {
        throw failed.error;
      }

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setWarehouses(warehousesResult.data || []);
      setStockSummary(stockSummaryResult.data || []);
      setStockByLocation(stockByLocationResult.data || []);
      setMoveHistory(movementsResult.data || []);
      setReceipts(receiptsResult.data || []);
      setDeliveries(deliveriesResult.data || []);
      setTransfers(transfersResult.data || []);
      setAdjustments(adjustmentsResult.data || []);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(err?.message || "Unable to load dashboard data from Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const warehouseMap = useMemo(() => {
    return new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));
  }, [warehouses]);

  const stockByProduct = useMemo(() => {
    const map = new Map();

    const stockRows = warehouseId === "all" ? stockSummary : stockByLocation;

    for (const stock of stockRows) {
      const product = productMap.get(stock.product_id);

      if (!product) continue;

      if (categoryId !== "all" && product.category_id !== categoryId) {
        continue;
      }

      if (warehouseId !== "all" && stock.warehouse_id !== warehouseId) {
        continue;
      }

      const current = map.get(stock.product_id) || 0;

      map.set(
        stock.product_id,
        current + Number(stock.total_stock ?? stock.stock_quantity ?? 0),
      );
    }

    return map;
  }, [stockSummary, stockByLocation, productMap, categoryId, warehouseId]);

  const productStock = useMemo(() => {
    return products.map((product) => {
      const quantity = stockByProduct.get(product.id) || 0;

      return {
        ...product,
        stock: quantity,
        categoryName:
          categoryMap.get(product.category_id)?.name || "Uncategorized",
      };
    });
  }, [products, stockByProduct, categoryMap]);

  const totalProductsInStock = useMemo(() => {
    return productStock.filter((product) => product.stock > 0).length;
  }, [productStock]);

  const lowStockProducts = useMemo(() => {
    return productStock.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= Number(product.reorder_level || 0),
    );
  }, [productStock]);

  const outOfStockProducts = useMemo(() => {
    return productStock.filter((product) => product.stock <= 0);
  }, [productStock]);

  const filteredDocuments = useMemo(() => {
    const matchesWarehouse = (warehouseIds) => {
      if (warehouseId === "all") return true;

      return warehouseIds.some((id) => id === warehouseId);
    };

    const matchesStatus = (itemStatus) => {
      if (status === "all") return true;

      return itemStatus === status;
    };

    return {
      receipts:
        documentType === "all" || documentType === "receipt"
          ? receipts.filter(
              (receipt) =>
                matchesStatus(receipt.status) &&
                matchesWarehouse([receipt.warehouse_id]),
            )
          : [],

      deliveries:
        documentType === "all" || documentType === "delivery"
          ? deliveries.filter(
              (delivery) =>
                matchesStatus(delivery.status) &&
                matchesWarehouse([delivery.warehouse_id]),
            )
          : [],

      transfers:
        documentType === "all" || documentType === "transfer"
          ? transfers.filter(
              (transfer) =>
                matchesStatus(transfer.status) &&
                matchesWarehouse([
                  transfer.source_warehouse_id,
                  transfer.destination_warehouse_id,
                ]),
            )
          : [],

      adjustments:
        documentType === "all" || documentType === "adjustment"
          ? adjustments.filter(
              (adjustment) =>
                matchesStatus(adjustment.status) &&
                matchesWarehouse([adjustment.warehouse_id]),
            )
          : [],
    };
  }, [
    documentType,
    status,
    warehouseId,
    receipts,
    deliveries,
    transfers,
    adjustments,
  ]);

  const pendingReceipts = useMemo(() => {
    return filteredDocuments.receipts.filter(
      (receipt) => receipt.status === "waiting" || receipt.status === "ready",
    ).length;
  }, [filteredDocuments.receipts]);

  const pendingDeliveries = useMemo(() => {
    return filteredDocuments.deliveries.filter(
      (delivery) =>
        delivery.status === "waiting" || delivery.status === "ready",
    ).length;
  }, [filteredDocuments.deliveries]);

  const pendingTransfers = useMemo(() => {
    return filteredDocuments.transfers.filter(
      (transfer) =>
        transfer.status === "waiting" || transfer.status === "ready",
    ).length;
  }, [filteredDocuments.transfers]);

  const filteredMovements = useMemo(() => {
    return moveHistory
      .filter((movement) => {
        if (warehouseId !== "all" && movement.warehouse_id !== warehouseId) {
          return false;
        }

        const product = productMap.get(movement.product_id);
        if (!product) return false;

        if (categoryId !== "all" && product.category_id !== categoryId) {
          return false;
        }

        if (search.trim()) {
          const query = search.toLowerCase();

          const productMatches =
            movement.product_name?.toLowerCase().includes(query) ||
            movement.sku?.toLowerCase().includes(query);

          if (!productMatches) return false;
        }

        const typeMatches =
          documentType === "all" ||
          (documentType === "receipt" &&
            movement.movement_type === "receipt") ||
          (documentType === "delivery" &&
            movement.movement_type === "delivery") ||
          (documentType === "transfer" &&
            (movement.movement_type === "transfer_in" ||
              movement.movement_type === "transfer_out")) ||
          (documentType === "adjustment" &&
            movement.movement_type === "adjustment");

        return typeMatches;
      })
      .slice(0, 8);
  }, [moveHistory, productMap, warehouseId, categoryId, search, documentType]);

  const dashboardKpis = [
    {
      title: "Products in stock",
      value: totalProductsInStock,
      detail: "Active products with available stock",
      icon: Boxes,
      tone: "blue",
    },
    {
      title: "Low stock items",
      value: lowStockProducts.length,
      detail: "At or below their reorder threshold",
      icon: AlertTriangle,
      tone: "amber",
    },
    {
      title: "Out of stock",
      value: outOfStockProducts.length,
      detail: "Active products with no available stock",
      icon: Package,
      tone: "red",
    },
    {
      title: "Pending receipts",
      value: pendingReceipts,
      detail: "Waiting or ready to receive",
      icon: ArrowDownToLine,
      tone: "emerald",
    },
    {
      title: "Pending deliveries",
      value: pendingDeliveries,
      detail: "Waiting or ready to fulfill",
      icon: ArrowUpFromLine,
      tone: "cyan",
    },
    {
      title: "Transfers scheduled",
      value: pendingTransfers,
      detail: "Waiting or ready to move",
      icon: ArrowLeftRight,
      tone: "indigo",
    },
  ];

  const kpiToneClasses = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    emerald: "bg-emerald-50 text-emerald-700",
    cyan: "bg-cyan-50 text-cyan-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  const resetFilters = () => {
    setDocumentType("all");
    setStatus("all");
    setWarehouseId("all");
    setCategoryId("all");
    setSearch("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading StockSense dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Inventory Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Inventory Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor stock, operations, and warehouse activity in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />

          <div>
            <p className="font-semibold">Dashboard data error</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardKpis.map(({ title, value, detail, icon: Icon, tone }) => (
          <article
            key={title}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className={`grid h-10 w-10 place-items-center rounded-lg ${kpiToneClasses[tone]}`}
              >
                <Icon size={19} />
              </div>
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-200 transition-colors group-hover:bg-blue-500" />
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-600">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {value.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
          </article>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Inventory Filters
            </h2>

            <p className="text-sm text-slate-500">
              Filter stock and operational activity.
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Reset filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {DOCUMENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Warehouse
            </label>

            <select
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Warehouses</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product Category
            </label>

            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search Product
            </label>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or SKU..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts + Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Low Stock */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Stock Alerts</h2>

              <p className="text-sm text-slate-500">
                Products that need attention.
              </p>
            </div>

            <AlertTriangle className="text-amber-500" size={20} />
          </div>

          <div className="divide-y divide-slate-100">
            {lowStockProducts.length === 0 &&
            outOfStockProducts.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="mx-auto text-emerald-500" size={32} />

                <p className="mt-3 font-semibold text-slate-800">
                  Stock levels look good
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  No low or out-of-stock products found.
                </p>
              </div>
            ) : (
              [...outOfStockProducts, ...lowStockProducts]
                .slice(0, 6)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        SKU: {product.sku || "-"} · {product.categoryName}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`font-bold ${
                          product.stock <= 0 ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {product.stock}
                      </p>

                      <p className="text-xs text-slate-400">
                        Reorder: {product.reorder_level || 0}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Stock Activity
              </h2>

              <p className="text-sm text-slate-500">
                Latest inventory movements.
              </p>
            </div>

            <Warehouse className="text-blue-500" size={20} />
          </div>

          <div className="divide-y divide-slate-100">
            {filteredMovements.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="mx-auto text-slate-300" size={32} />

                <p className="mt-3 font-semibold text-slate-700">
                  No stock activity found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your filters.
                </p>
              </div>
            ) : (
              filteredMovements.map((movement) => {
                const product = productMap.get(movement.product_id);
                const warehouse = warehouseMap.get(movement.warehouse_id);

                const movementStyle =
                  MOVEMENT_STYLES[movement.movement_type] ||
                  MOVEMENT_STYLES.adjustment;

                const Icon = movementStyle.icon;

                return (
                  <div
                    key={movement.id}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className={`rounded-xl p-2.5 ${movementStyle.badge}`}>
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">
                        {product?.name || "Unknown Product"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {MOVEMENT_LABELS[movement.movement_type] ||
                          movement.movement_type}
                        {" · "}
                        {warehouse?.name || "Unknown Warehouse"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(movement.created_at)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`font-bold ${
                          Number(movement.quantity) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {Number(movement.quantity) > 0 ? "+" : ""}
                        {Number(movement.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Inventory Overview
          </h2>

          <p className="text-sm text-slate-500">
            Current stock status by product.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  SKU
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Current Stock
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Reorder Level
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {productStock
                .filter((product) => {
                  if (!search.trim()) return true;

                  const query = search.toLowerCase();

                  return (
                    product.name?.toLowerCase().includes(query) ||
                    product.sku?.toLowerCase().includes(query)
                  );
                })
                .slice(0, 10)
                .map((product) => {
                  const isOut = product.stock <= 0;
                  const isLow =
                    !isOut &&
                    product.stock <= Number(product.reorder_level || 0);

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {product.name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {product.sku || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {product.categoryName}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {product.reorder_level || 0}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isOut
                              ? "bg-red-100 text-red-700"
                              : isLow
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isOut
                            ? "Out of Stock"
                            : isLow
                              ? "Low Stock"
                              : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
