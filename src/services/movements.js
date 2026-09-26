import { supabase } from "./supabase";

export async function getMovementOptions() {
  const [productsResult, warehousesResult, locationsResult] = await Promise.all(
    [
      supabase.from("products").select("id, name, sku").order("name"),
      supabase.from("warehouses").select("id, name, code").order("name"),
      supabase
        .from("locations")
        .select("id, warehouse_id, name, code")
        .order("name"),
    ],
  );

  for (const result of [productsResult, warehousesResult, locationsResult]) {
    if (result.error) throw result.error;
  }

  return {
    products: productsResult.data || [],
    warehouses: warehousesResult.data || [],
    locations: locationsResult.data || [],
  };
}

export async function getMoveHistory(filters = {}) {
  let query = supabase
    .from("move_history")
    .select(
      `
      id,
      created_at,
      product_id,
      product_name,
      sku,
      warehouse_id,
      warehouse_name,
      location_id,
      location_name,
      movement_type,
      quantity,
      reference_number,
      created_by_name
    `,
    )
    .order("created_at", { ascending: false });

  if (filters.productId) query = query.eq("product_id", filters.productId);
  if (filters.movementType) {
    query = query.eq("movement_type", filters.movementType);
  }
  if (filters.warehouseId) {
    query = query.eq("warehouse_id", filters.warehouseId);
  }
  if (filters.locationId) query = query.eq("location_id", filters.locationId);
  if (filters.dateFrom) {
    query = query.gte("created_at", new Date(filters.dateFrom).toISOString());
  }
  if (filters.dateTo) {
    const dateTo = new Date(`${filters.dateTo}T23:59:59.999`);
    query = query.lte("created_at", dateTo.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
