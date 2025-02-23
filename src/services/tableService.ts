
import { supabase } from "@/integrations/supabase/client";
import { TableLayout } from "@/types/staff";

export const fetchTables = async (): Promise<TableLayout[]> => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  if (error) throw error;
  
  // Validate and cast the section field to the correct type
  return data.map(table => ({
    ...table,
    section: table.section as "indoor" | "outdoor" | "bar",
  }));
};

export const addTable = async (table: Omit<TableLayout, "id">) => {
  const { data, error } = await supabase
    .from('tables')
    .insert([table])
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    section: data.section as "indoor" | "outdoor" | "bar",
  };
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
  return {
    ...data,
    section: data.section as "indoor" | "outdoor" | "bar",
  };
};
