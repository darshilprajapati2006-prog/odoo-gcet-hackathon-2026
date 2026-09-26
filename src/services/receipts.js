import { supabase } from "./supabase";

// Fetch all receipts with supplier, warehouse and receipt items
export async function getReceipts() {
  const { data, error } = await supabase
    .from("receipts")
    .select(`
      id,
      receipt_number,
      supplier_id,
      warehouse_id,
      destination_location_id,
      status,
      expected_date,
      notes,
      created_at,
      suppliers (
        id,
        name
      ),
      warehouses (
        id,
        name,
        code
      ),
      receipt_items (
        id,
        product_id,
        quantity,
        products (
          id,
          name,
          sku
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Fetch suppliers
export async function getSuppliers() {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name");

  if (error) {
    throw error;
  }

  return data || [];
}

// Fetch warehouses
export async function getWarehouses() {
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw error;
  }

  return data || [];
}

// Fetch active products
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw error;
  }

  return data || [];
}

// Create receipt header
export async function createReceipt({
  receiptNumber,
  supplierId,
  warehouseId,
  destinationLocationId,
  expectedDate,
  notes,
}) {
  const { data, error } = await supabase
    .from("receipts")
    .insert({
      receipt_number: receiptNumber,
      supplier_id: supplierId || null,
      warehouse_id: warehouseId,
      destination_location_id: destinationLocationId,
      expected_date: expectedDate || null,
      notes: notes || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Add a product line to a receipt
export async function addReceiptItem({
  receiptId,
  productId,
  quantity,
}) {
  const { data, error } = await supabase
    .from("receipt_items")
    .insert({
      receipt_id: receiptId,
      product_id: productId,
      quantity: Number(quantity),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Update receipt status
export async function updateReceiptStatus(receiptId, status) {
  const { data, error } = await supabase
    .from("receipts")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", receiptId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Validate receipt through Supabase RPC
//
// Important:
// We do NOT manually update stock here.
// validate_receipt() creates stock_movements
// and changes the receipt status to done.
export async function validateReceipt(receiptId) {
  const { data, error } = await supabase.rpc(
    "validate_receipt",
    {
      p_receipt_id: receiptId,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

// Delete a draft receipt
export async function deleteReceipt(receiptId) {
  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id", receiptId)
    .eq("status", "draft");

  if (error) {
    throw error;
  }

  return true;
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