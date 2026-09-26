import { supabase } from "./supabase";

export async function getTransfers() {
  const { data, error } = await supabase
    .from("transfers")
    .select(
      `
      *,
      transfer_items (
        id,
        product_id,
        quantity,
        products ( id, name, sku )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTransferOptions() {
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
        .select("id, name, sku")
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

export async function createTransfer({
  transferNumber,
  sourceWarehouseId,
  sourceLocationId,
  destinationWarehouseId,
  destinationLocationId,
  productId,
  quantity,
  scheduledDate,
  notes,
}) {
  const { data: transfer, error } = await supabase
    .from("transfers")
    .insert({
      transfer_number: transferNumber,
      source_warehouse_id: sourceWarehouseId,
      source_location_id: sourceLocationId,
      destination_warehouse_id: destinationWarehouseId,
      destination_location_id: destinationLocationId,
      scheduled_date: scheduledDate || null,
      notes: notes || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;

  const { error: itemError } = await supabase.from("transfer_items").insert({
    transfer_id: transfer.id,
    product_id: productId,
    quantity: Number(quantity),
  });

  if (itemError) {
    await supabase.from("transfers").delete().eq("id", transfer.id);
    throw itemError;
  }

  return transfer;
}

export async function updateTransferStatus(id, status) {
  const { data, error } = await supabase
    .from("transfers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function validateTransfer(id) {
  const { data, error } = await supabase.rpc("validate_transfer", {
    p_transfer_id: id,
  });

  if (error) throw error;
  return data;
}
