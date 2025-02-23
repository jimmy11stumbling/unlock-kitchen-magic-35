
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { KitchenOrder } from "@/types/staff";

interface KitchenHeaderProps {
  activeView: "all" | "pending" | "preparing" | "ready";
  onViewChange: (view: "all" | "pending" | "preparing" | "ready") => void;
  kitchenOrders: KitchenOrder[];
}

export const KitchenHeader = ({
  activeView,
  onViewChange,
  kitchenOrders,
}: KitchenHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold">Kitchen Display</h2>
        <p className="text-muted-foreground">
          Active Orders: {kitchenOrders.filter(order => 
            order.items.some(item => item.status === "preparing")
          ).length}
        </p>
      </div>
      <div className="flex gap-4">
        <Select value={activeView} onValueChange={onViewChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">In Progress</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
