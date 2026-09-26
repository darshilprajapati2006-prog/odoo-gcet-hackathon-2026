import { supabase } from "./supabase";

export async function getProducts() {
  const [productsResult, stockResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, sku, category_id, unit_of_measure, reorder_level, is_active, created_at, updated_at",
      )
      .order("created_at", { ascending: false }),
    supabase.from("product_stock_summary").select("product_id, total_stock"),
  ]);

  if (productsResult.error) throw productsResult.error;
  if (stockResult.error) throw stockResult.error;

  const products = productsResult.data || [];
  const stockByProduct = new Map(
    (stockResult.data || []).map((stock) => [
      stock.product_id,
      Number(stock.total_stock || 0),
    ]),
  );
  const inactiveIds = products
    .filter((product) => !product.is_active)
    .map((product) => product.id);

  if (inactiveIds.length > 0) {
    const { data: movements, error: movementError } = await supabase
      .from("stock_movements")
      .select("product_id, quantity")
      .in("product_id", inactiveIds);

    if (movementError) throw movementError;
    for (const movement of movements || []) {
      stockByProduct.set(
        movement.product_id,
        (stockByProduct.get(movement.product_id) || 0) +
          Number(movement.quantity || 0),
      );
    }
  }

  return products.map((product) => ({
    ...product,
    total_stock: stockByProduct.get(product.id) || 0,
  }));
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      sku,
      category_id,
      unit_of_measure,
      reorder_level,
      is_active,
      created_at,
      updated_at
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        unit_of_measure: product.unit_of_measure,
        reorder_level: product.reorder_level,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProduct(id, product) {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (product.name !== undefined) {
    updateData.name = product.name;
  }

  if (product.sku !== undefined) {
    updateData.sku = product.sku;
  }

  if (product.category_id !== undefined) {
    updateData.category_id = product.category_id;
  }

  if (product.unit_of_measure !== undefined) {
    updateData.unit_of_measure = product.unit_of_measure;
  }

  if (product.reorder_level !== undefined) {
    updateData.reorder_level = product.reorder_level;
  }

  if (product.is_active !== undefined) {
    updateData.is_active = product.is_active;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deactivateProduct(id) {
  return updateProduct(id, {
    is_active: false,
  });
}
