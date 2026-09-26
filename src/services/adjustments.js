import { supabase } from "./supabase";

export async function getAdjustments() {
  const { data, error } = await supabase
    .from("stock_adjustments")
    .select(
      `
      *,
      products ( id, name, sku, unit_of_measure ),
      warehouses ( id, name, code ),
      locations ( id, name, code )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAdjustmentOptions() {
  const [warehousesResult, locationsResult, productsResult] = await Promise.all(
    [
      supabase
        .from("warehouses")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("locations")
        .select("id, warehouse_id, name, code")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("products")
        .select("id, name, sku, unit_of_measure")
        .eq("is_active", true)
        .order("name"),
    ],
  );

  for (const result of [warehousesResult, locationsResult, productsResult]) {
    if (result.error) throw result.error;
  }

  return {
    warehouses: warehousesResult.data || [],
    locations: locationsResult.data || [],
    products: productsResult.data || [],
  };
}

export async function getStockAtLocation(productId, locationId) {
  const { data, error } = await supabase
    .from("product_stock_by_location")
    .select("stock_quantity")
    .eq("product_id", productId)
    .eq("location_id", locationId)
    .maybeSingle();

  if (error) throw error;
  return Number(data?.stock_quantity || 0);
}

export async function createAdjustment({
  adjustmentNumber,
  productId,
  warehouseId,
  locationId,
  systemQuantity,
  countedQuantity,
  reason,
}) {
  const { data, error } = await supabase
    .from("stock_adjustments")
    .insert({
      adjustment_number: adjustmentNumber,
      product_id: productId,
      warehouse_id: warehouseId,
      location_id: locationId,
      system_quantity: Number(systemQuantity),
      counted_quantity: Number(countedQuantity),
      reason: reason || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdjustmentStatus(id, status) {
  const { data, error } = await supabase
    .from("stock_adjustments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function validateAdjustment(id) {
  const { data, error } = await supabase.rpc("validate_stock_adjustment", {
    p_adjustment_id: id,
  });

  if (error) throw error;
  return data;
}
