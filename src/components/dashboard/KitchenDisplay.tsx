
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { KitchenOrder, MenuItem } from "@/types/staff";
import { useState } from "react";
import { KitchenHeader } from "./kitchen/KitchenHeader";
import { KitchenOrderCard } from "./kitchen/KitchenOrderCard";

interface KitchenDisplayProps {
  kitchenOrders: KitchenOrder[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: number, itemId: number, status: KitchenOrder["items"][0]["status"]) => void;
}

export const KitchenDisplay = ({
  kitchenOrders,
  menuItems,
  onUpdateOrderStatus,
}: KitchenDisplayProps) => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"all" | "pending" | "preparing" | "ready">("all");

  const playAlertSound = () => {
    const audio = new Audio('/alert.mp3');
    audio.play().catch(console.error);
  };

  const filteredOrders = kitchenOrders.filter(order => {
    if (activeView === "all") return true;
    return order.items.some(item => item.status === activeView);
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Rush orders first
    if (a.priority === "rush" && b.priority !== "rush") return -1;
    if (b.priority === "rush" && a.priority !== "rush") return 1;
    
    // Then high priority
    if (a.priority === "high" && b.priority === "normal") return -1;
    if (b.priority === "high" && a.priority === "normal") return 1;
    
    // Finally sort by time
    return new Date(b.items[0]?.startTime || "").getTime() - 
           new Date(a.items[0]?.startTime || "").getTime();
  });

  const handleStatusUpdate = (orderId: number, itemId: number, status: KitchenOrder["items"][0]["status"]) => {
    onUpdateOrderStatus(orderId, itemId, status);
    
    if (status === "ready") {
      playAlertSound();
      toast({
        title: "Order Ready!",
        description: "An order is ready for pickup",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <KitchenHeader
          activeView={activeView}
          onViewChange={setActiveView}
          kitchenOrders={kitchenOrders}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedOrders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              menuItems={menuItems}
              activeView={activeView}
              onUpdateOrderStatus={handleStatusUpdate}
            />
          ))}
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No active orders matching the selected filter
          </div>
        )}
      </Card>
    </div>
  );
};
