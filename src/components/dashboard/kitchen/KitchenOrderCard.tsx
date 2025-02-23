
import { Card } from "@/components/ui/card";
import { ChefHat, Flame } from "lucide-react";
import type { KitchenOrder } from "@/types/staff";
import { KitchenOrderItem } from "./KitchenOrderItem";
import type { MenuItem } from "@/types/staff";

interface KitchenOrderCardProps {
  order: KitchenOrder;
  menuItems: MenuItem[];
  activeView: "all" | "pending" | "preparing" | "ready";
  onUpdateOrderStatus: (orderId: number, itemId: number, status: KitchenOrder["items"][0]["status"]) => void;
}

export const KitchenOrderCard = ({
  order,
  menuItems,
  activeView,
  onUpdateOrderStatus,
}: KitchenOrderCardProps) => {
  const getOrderProgress = (order: KitchenOrder) => {
    const total = order.items.length;
    const completed = order.items.filter(item => item.status === "ready").length;
    return (completed / total) * 100;
  };

  const progress = getOrderProgress(order);

  return (
    <Card className={`p-4 ${
      order.priority === "rush" ? "border-red-500 bg-red-50" :
      order.priority === "high" ? "border-yellow-500 bg-yellow-50" : ""
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Order #{order.orderId}</h3>
            {order.priority === "rush" && (
              <span className="flex items-center gap-1 text-red-600">
                <Flame className="h-4 w-4" />
                Rush
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Progress: {Math.round(progress)}%
          </p>
        </div>
        <ChefHat className={`w-6 h-6 ${
          order.priority === "rush" ? "text-red-500" :
          order.priority === "high" ? "text-yellow-500" : "text-blue-500"
        }`} />
      </div>

      <div className="space-y-3">
        {order.items.map((item) => {
          if (activeView !== "all" && item.status !== activeView) return null;
          return (
            <KitchenOrderItem
              key={item.menuItemId}
              item={item}
              menuItem={menuItems.find((m) => m.id === item.menuItemId)}
              onStatusUpdate={(status) => onUpdateOrderStatus(order.id, item.menuItemId, status)}
            />
          );
        })}
      </div>

      {order.notes && (
        <div className="mt-3 text-sm bg-muted p-2 rounded">
          <p className="font-medium">Notes:</p>
          <p>{order.notes}</p>
        </div>
      )}
    </Card>
  );
};
