import { supabase } from "./supabase";

export const getAdjustments = async () => {
  const { data, error } = await supabase
    .from("adjustments")
    .select("*");

  if (error) throw error;

  return data;
};

export const createAdjustment = async (data) => {
  const { data: result, error } = await supabase
    .from("adjustments")
    .insert([data])
    .select();

  if (error) throw error;

  return result;
};

export const deleteAdjustment = async (id) => {
  const { error } = await supabase
    .from("adjustments")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const getAdjustmentById = async (id) => {
  const { data, error } = await supabase
    .from("adjustments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};