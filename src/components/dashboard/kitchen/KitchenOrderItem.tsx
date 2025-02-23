
import { Button } from "@/components/ui/button";
import { Check, Timer } from "lucide-react";
import type { KitchenOrder, MenuItem } from "@/types/staff";

interface KitchenOrderItemProps {
  item: KitchenOrder["items"][0];
  menuItem?: MenuItem;
  onStatusUpdate: (status: KitchenOrder["items"][0]["status"]) => void;
}

export const KitchenOrderItem = ({
  item,
  menuItem,
  onStatusUpdate,
}: KitchenOrderItemProps) => {
  const calculateTimeElapsed = (startTime: string | undefined) => {
    if (!startTime) return 0;
    return Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 60000);
  };

  const timeElapsed = calculateTimeElapsed(item.startTime);
  const isOverdue = timeElapsed > (menuItem?.preparationTime || 0);

  return (
    <div
      className={`p-3 rounded-lg border ${
        item.status === "preparing" && isOverdue ? "border-red-200 bg-red-50" :
        item.status === "preparing" ? "border-yellow-200 bg-yellow-50" :
        item.status === "ready" ? "border-green-200 bg-green-50" :
        "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{menuItem?.name}</p>
          <p className="text-sm text-muted-foreground">
            Qty: {item.quantity} • Est. Time: {menuItem?.preparationTime}min
          </p>
        </div>
        {item.status === "preparing" && (
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className={`text-sm font-medium ${
              isOverdue ? "text-red-600" : ""
            }`}>
              {timeElapsed}min
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-end space-x-2">
        {item.status === "pending" && (
          <Button
            size="sm"
            onClick={() => onStatusUpdate("preparing")}
          >
            Start Preparing
          </Button>
        )}
        {item.status === "preparing" && (
          <Button
            size="sm"
            onClick={() => onStatusUpdate("ready")}
          >
            <Check className="w-4 h-4 mr-1" />
            Mark Ready
          </Button>
        )}
      </div>
    </div>
  );
};
