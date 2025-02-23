
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { TableLayout } from "@/types/staff";
import { fetchTables, addTable as addTableService, updateTableStatus as updateTableStatusService } from "@/services/tableService";
import { supabase } from "@/integrations/supabase/client";

export const useTableState = () => {
  const [tables, setTables] = useState<TableLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial tables data
  useEffect(() => {
    const loadTables = async () => {
      try {
        const data = await fetchTables();
        setTables(data);
      } catch (error) {
        console.error("Error loading tables:", error);
        toast({
          title: "Error",
          description: "Failed to load tables",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, [toast]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'INSERT') {
            const newTable = {
              ...payload.new,
              section: payload.new.section as "indoor" | "outdoor" | "bar"
            } as TableLayout;
            setTables(current => [...current, newTable]);
          } else if (payload.eventType === 'UPDATE') {
            setTables(current =>
              current.map(table =>
                table.id === payload.new.id 
                  ? { ...table, ...payload.new, section: payload.new.section as "indoor" | "outdoor" | "bar" }
                  : table
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTable = async (tableData: Omit<TableLayout, "id">) => {
    try {
      await addTableService(tableData);
      toast({
        title: "Success",
        description: "Table added successfully",
      });
    } catch (error) {
      console.error("Error adding table:", error);
      toast({
        title: "Error",
        description: "Failed to add table",
        variant: "destructive",
      });
    }
  };

  const updateTableStatus = async (tableId: number, status: TableLayout["status"]) => {
    try {
      await updateTableStatusService(tableId, status);
      toast({
        title: "Success",
        description: `Table status updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating table status:", error);
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive",
      });
    }
  };

  return {
    tables,
    isLoading,
    addTable,
    updateTableStatus,
  };
};
