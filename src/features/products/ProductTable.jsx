import ProductStatusBadge from "./ProductStatusBadge";
import { Pencil, Power } from "lucide-react";

function ProductTable({ products, onEdit, onDeactivate, onActivate }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Product Name
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                SKU
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Category
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                UOM
              </th>

              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Total Stock
              </th>

              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Reorder Level
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Stock Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
                    !product.isActive ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">
                      {product.name}
                    </div>

                    {!product.isActive && (
                      <span className="mt-1 inline-block text-xs text-red-500">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {product.sku}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {product.category}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {product.unit}
                  </td>

                  <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums text-slate-900">
                    {product.stock}
                  </td>

                  <td className="px-4 py-4 text-right text-sm tabular-nums text-slate-600">
                    {product.reorderLevel}
                  </td>

                  <td className="px-4 py-4">
                    <ProductStatusBadge
                      stock={product.stock}
                      reorderLevel={product.reorderLevel}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Edit product"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => onEdit(product)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil size={14} /> Edit
                      </button>

                      {product.isActive ? (
                        <button
                          type="button"
                          title="Deactivate product"
                          aria-label={`Deactivate ${product.name}`}
                          onClick={() => onDeactivate(product.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Power size={14} /> Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Activate product"
                          aria-label={`Activate ${product.name}`}
                          onClick={() => onActivate(product.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Power size={14} /> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
        Showing {products.length} product{products.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

export default ProductTable;
