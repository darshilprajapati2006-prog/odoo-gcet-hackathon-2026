import ProductStatusBadge from "./ProductStatusBadge";

function ProductTable({ products, onEdit, onDeactivate, onActivate }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Product Name
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                SKU
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Category
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                UOM
              </th>

              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Total Stock
              </th>

              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Reorder Level
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Stock Status
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
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
                  className={`border-b last:border-b-0 hover:bg-gray-50 ${
                    !product.isActive ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {product.name}
                    </div>

                    {!product.isActive && (
                      <span className="mt-1 inline-block text-xs text-red-500">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700">
                    {product.sku}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700">
                    {product.category}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700">
                    {product.unit}
                  </td>

                  <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                    {product.stock}
                  </td>

                  <td className="px-4 py-4 text-right text-sm text-gray-700">
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
                        onClick={() => onEdit(product)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </button>

                      {product.isActive ? (
                        <button
                          onClick={() => onDeactivate(product.id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate(product.id)}
                          className="rounded-md border border-green-200 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
                        >
                          Activate
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

      <div className="border-t bg-gray-50 px-4 py-3 text-sm text-gray-500">
        Showing {products.length} product{products.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

export default ProductTable;
