
import { TablePanel } from "@/components/dashboard/TablePanel";
import { useDashboardState } from "@/hooks/useDashboardState";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Tables = () => {
  const { tables, isLoading, addTable, updateTableStatus } = useDashboardState();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Table Management</h1>
      {tables.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Tables Found</AlertTitle>
          <AlertDescription>
            No tables have been added yet. Add your first table to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <TablePanel
          tables={tables}
          onAddTable={addTable}
          onUpdateStatus={updateTableStatus}
        />
      )}
    </div>
  );
};

export default Tables;
