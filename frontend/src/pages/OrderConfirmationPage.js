import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrder } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  Flame,
  Package,
  ChefHat,
  Loader2,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  new: { label: "Order Placed", color: "bg-blue-100 text-blue-800", icon: Package, step: 1 },
  accepted: { label: "Accepted", color: "bg-indigo-100 text-indigo-800", icon: CheckCircle, step: 2 },
  preparing: { label: "Preparing", color: "bg-amber-100 text-amber-800", icon: ChefHat, step: 3 },
  ready: { label: "Ready", color: "bg-green-100 text-green-800", icon: CheckCircle, step: 4 },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle, step: 5 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle, step: 0 },
};

const STEPS = ["Placed", "Accepted", "Preparing", "Ready"];

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = () => {
      fetchOrder(orderId)
        .then(setOrder)
        .catch(() => setError("Order not found"))
        .finally(() => setLoading(false));
    };
    load();
    // Poll for updates every 10s
    const interval = setInterval(() => {
      fetchOrder(orderId).then(setOrder).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E15A32]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
        <XCircle className="h-16 w-16 text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          Order Not Found
        </h2>
        <p className="text-stone-500 mb-6">We couldn't find this order</p>
        <Link to="/">
          <Button className="bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full px-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Menu
          </Button>
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
  const currentStep = statusInfo.step;
  const isRejected = order.status === "rejected";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full hover:bg-stone-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </Link>
          <Flame className="h-5 w-5 text-[#E15A32]" />
          <h1 className="text-lg font-bold text-stone-900" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Order #{order.order_number}
          </h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Banner */}
        <div
          data-testid="order-confirmation-banner"
          className={`rounded-2xl p-6 text-center mb-6 animate-fade-in-up ${
            isRejected ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
          }`}
        >
          {isRejected ? (
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          )}
          <h2
            className={`text-xl font-bold mb-1 ${isRejected ? "text-red-900" : "text-green-900"}`}
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
          >
            {isRejected ? "Order Rejected" : "Order Confirmed!"}
          </h2>
          <p className={`text-sm ${isRejected ? "text-red-600" : "text-green-600"}`}>
            {isRejected
              ? "Sorry, your order could not be processed"
              : "We've received your order and are getting it ready"}
          </p>
        </div>

        {/* Progress Tracker */}
        {!isRejected && order.status !== "completed" && (
          <div data-testid="order-progress-tracker" className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#E15A32] text-white"
                          : "bg-stone-100 text-stone-400"
                      } ${isCurrent ? "ring-4 ring-[#E15A32]/20" : ""}`}
                    >
                      {stepNum}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? "text-stone-900 font-medium" : "text-stone-400"}`}>
                      {step}
                    </span>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 ${
                          currentStep > stepNum ? "bg-[#E15A32]" : "bg-stone-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {order.estimated_prep_time > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-stone-600 bg-stone-50 rounded-xl py-2 mt-2">
                <Clock className="h-4 w-4 text-[#E15A32]" />
                Estimated time: ~{order.estimated_prep_time} min
              </div>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Order Details
            </h3>
            <Badge data-testid="order-status-badge" className={`${statusInfo.color} border-0 text-xs font-bold`}>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <span className="text-stone-900 font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  {item.add_ons?.length > 0 && (
                    <p className="text-stone-400 text-xs">+ {item.add_ons.map((a) => a.name).join(", ")}</p>
                  )}
                </div>
                <span className="text-stone-700 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-base font-bold">
            <span className="text-stone-900">Total</span>
            <span className="text-[#E15A32]">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="font-semibold text-stone-900 mb-3" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            {order.order_type === "delivery" ? "Delivery" : "Pickup"} Info
          </h3>
          <div className="space-y-2 text-sm text-stone-600">
            <p className="flex items-center gap-2">
              <span className="font-medium text-stone-900">{order.customer_name}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-stone-400" /> {order.customer_phone}
            </p>
            {order.customer_address && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-stone-400" /> {order.customer_address}
              </p>
            )}
            <p className="flex items-center gap-2">
              <Badge className="bg-stone-100 text-stone-600 border-stone-200 text-xs">Cash on Delivery</Badge>
            </p>
          </div>
        </div>

        {/* Back to menu */}
        <div className="text-center mt-8">
          <Link to="/">
            <Button
              data-testid="order-back-to-menu-btn"
              variant="outline"
              className="rounded-full px-6 border-stone-200 text-stone-700 hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Order More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
