import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, NEXT_STATUS } from "@/config/orderStatuses";
import { formatPrice, formatTime } from "@/lib/format";

export default function OrderCard({ order, onStatusUpdate }) {
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
  const nextStatuses = NEXT_STATUS[order.status] || [];
  const isNew = order.status === "new";

  return (
    <div
      data-testid={`admin-order-${order.id}`}
      className={`p-4 ${isNew ? "animate-highlight bg-yellow-50/50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 text-base">#{order.order_number}</span>
            <Badge
              data-testid={`order-status-${order.id}`}
              className={`${statusInfo.color} border text-xs font-bold`}
            >
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {order.customer_name} &middot; {order.customer_phone}
            {order.order_type === "delivery" && order.customer_address
              ? ` · ${order.customer_address}`
              : ""}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-stone-900">{formatPrice(order.total)}</p>
          <p className="text-xs text-stone-400">{formatTime(order.created_at)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-stone-50 rounded-lg p-3 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm py-0.5">
            <span className="text-stone-700">
              {item.quantity}x {item.name}
              {item.add_ons?.length > 0 && (
                <span className="text-stone-400 text-xs ml-1">
                  (+{item.add_ons.map((a) => a.name).join(", ")})
                </span>
              )}
            </span>
            <span className="text-stone-600 font-medium">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {nextStatuses.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {nextStatuses.map((status) => (
            <Button
              key={status}
              data-testid={`order-action-${order.id}-${status}`}
              size="sm"
              onClick={() => onStatusUpdate(order.id, status)}
              className={`rounded-full text-xs font-semibold active-scale ${
                status === "rejected"
                  ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                  : status === "accepted"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-[#E15A32] text-white hover:bg-[#C84B26]"
              }`}
              variant={status === "rejected" ? "outline" : "default"}
            >
              {status === "accepted" && "Accept"}
              {status === "rejected" && "Reject"}
              {status === "preparing" && "Start Preparing"}
              {status === "ready" && "Mark Ready"}
              {status === "completed" && "Complete"}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
