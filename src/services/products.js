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
  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id,
      unit_of_measure: product.unit_of_measure,
      reorder_level: product.reorder_level,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deactivateProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}