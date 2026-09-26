import { supabase } from "./supabase";

export async function getDeliveries() {
  const { data, error } = await supabase
    .from("deliveries")
    .select(
      `
      id,
      delivery_number,
      customer_id,
      warehouse_id,
      source_location_id,
      status,
      scheduled_date,
      notes,
      created_at,
      customers (
        id,
        name
      ),
      warehouses (
        id,
        name,
        code
      ),
      delivery_items (
        id,
        product_id,
        quantity,
        products (
          id,
          name,
          sku
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getWarehouses() {
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getLocations(warehouseId) {
  let query = supabase
    .from("locations")
    .select("id, warehouse_id, name, code")
    .eq("is_active", true)
    .order("name");

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createDelivery({
  deliveryNumber,
  customerId,
  warehouseId,
  sourceLocationId,
  scheduledDate,
  notes,
}) {
  const { data, error } = await supabase
    .from("deliveries")
    .insert({
      delivery_number: deliveryNumber,
      customer_id: customerId || null,
      warehouse_id: warehouseId,
      source_location_id: sourceLocationId,
      scheduled_date: scheduledDate || null,
      notes: notes || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addDeliveryItem({ deliveryId, productId, quantity }) {
  const { data, error } = await supabase
    .from("delivery_items")
    .insert({
      delivery_id: deliveryId,
      product_id: productId,
      quantity: Number(quantity),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addDeliveryItems({ deliveryId, items }) {
  const { data, error } = await supabase
    .from("delivery_items")
    .insert(
      items.map((item) => ({
        delivery_id: deliveryId,
        product_id: item.productId,
        quantity: Number(item.quantity),
      })),
    )
    .select();

  if (error) throw error;
  return data || [];
}

export async function deleteDelivery(deliveryId) {
  const { error } = await supabase
    .from("deliveries")
    .delete()
    .eq("id", deliveryId)
    .eq("status", "draft");

  if (error) throw error;
}

export async function updateDeliveryStatus(deliveryId, status) {
  const { data, error } = await supabase
    .from("deliveries")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function validateDelivery(deliveryId) {
  const { data, error } = await supabase.rpc("validate_delivery", {
    p_delivery_id: deliveryId,
  });

  if (error) throw error;
  return data;
}
