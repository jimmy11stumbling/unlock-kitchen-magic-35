
import { supabase } from "@/integrations/supabase/client";
import { TableLayout } from "@/types/staff";

export const fetchTables = async () => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  if (error) throw error;
  return data;
};

export const addTable = async (table: Omit<TableLayout, "id">) => {
  const { data, error } = await supabase
    .from('tables')
    .insert([table])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTableStatus = async (
  id: number, 
  status: TableLayout["status"]
) => {
  const { data, error } = await supabase
    .from('tables')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
