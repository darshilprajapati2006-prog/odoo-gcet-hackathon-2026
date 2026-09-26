import { supabase } from "./supabase";

export const getTransfers = async () => {
    const { data, error } = await supabase
        .from("transfers")
        .select("*");

    if (error) throw error;

    return data;
};

export const createTransfer = async (data) => {
    const { data, error } = await supabase
        .from("transfers")
        .insert([data])
        .select();

    if (error) throw error;

    return data;
};

export const deleteTransfer = async (id) => {
     const { error } = await supabase
        .from("transfers")
        .delete()
        .eq("id", id);

    if (error) throw error;
};

export const getTransferById = async (id) => {
 const { data, error } = await supabase
        .from("transfers")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
};

