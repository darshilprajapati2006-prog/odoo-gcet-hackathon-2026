import { supabase } from "./supabase";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      sku,
      category_id,
      unit_of_measure,
      initial_stock,
      reorder_level,
      is_active,
      created_at,
      updated_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      sku,
      category_id,
      unit_of_measure,
      initial_stock,
      reorder_level,
      is_active,
      created_at,
      updated_at
    `)
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
        initial_stock: product.initial_stock,
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