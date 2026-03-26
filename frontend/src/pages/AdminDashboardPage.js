import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminOrders,
  fetchAdminStats,
  updateOrderStatus,
  updateSettings,
  fetchSettings,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Flame,
  LogOut,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChefHat,
  Package,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Package },
  accepted: { label: "Accepted", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: CheckCircle },
  preparing: { label: "Preparing", color: "bg-amber-100 text-amber-800 border-amber-200", icon: ChefHat },
  ready: { label: "Ready", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-stone-100 text-stone-600 border-stone-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

const NEXT_STATUS = {
  new: ["accepted", "rejected"],
  accepted: ["preparing"],
  preparing: ["ready"],
  ready: ["completed"],
};

// Simple beep sound using AudioContext
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Ignore audio errors
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettingsState] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const prevOrderCount = useRef(0);
  const pollingRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [ordersData, statsData, settingsData] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminStats(),
        fetchSettings(),
      ]);
      const newOrders = ordersData.orders || [];

      // Sound notification for new orders
      if (
        soundEnabled &&
        prevOrderCount.current > 0 &&
        newOrders.length > prevOrderCount.current
      ) {
        playNotificationSound();
        toast.info("New order received!");
      }
      prevOrderCount.current = newOrders.length;

      setOrders(newOrders);
      setStats(statsData);
      setSettingsState(settingsData);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
      }
    }
  }, [navigate, soundEnabled]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin");
      return;
    }
    loadData();
    pollingRef.current = setInterval(loadData, 5000);
    return () => clearInterval(pollingRef.current);
  }, [loadData, navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order ${newStatus}`);
      loadData();
    } catch {
      toast.error("Failed to update order");
    }
  };

  const handleToggleOpen = async (isOpen) => {
    try {
      await updateSettings({ is_open: isOpen });
      setSettingsState((prev) => ({ ...prev, is_open: isOpen }));
      toast.success(isOpen ? "Restaurant is now Open" : "Restaurant is now Closed");
    } catch {
      toast.error("Failed to update setting");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    navigate("/admin");
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : activeTab === "active"
      ? orders.filter((o) => ["new", "accepted", "preparing", "ready"].includes(o.status))
      : orders.filter((o) => o.status === activeTab);

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Admin Navbar */}
      <nav data-testid="admin-navbar" className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-[#E15A32]" />
            <span className="text-lg font-bold text-stone-900" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              {settings?.restaurant_name || "Admin"}
            </span>
            <Badge className="bg-stone-100 text-stone-600 border-stone-200 text-xs">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            {/* Open/Close Toggle */}
            <div data-testid="restaurant-toggle" className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500 hidden sm:inline">
                {settings?.is_open ? "Open" : "Closed"}
              </span>
              <Switch
                data-testid="restaurant-open-switch"
                checked={settings?.is_open || false}
                onCheckedChange={handleToggleOpen}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            {/* Sound Toggle */}
            <button
              data-testid="sound-toggle-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
              title={soundEnabled ? "Mute notifications" : "Enable notifications"}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-stone-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-stone-400" />
              )}
            </button>
            {/* Refresh */}
            <button
              data-testid="manual-refresh-btn"
              onClick={handleManualRefresh}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 text-stone-600 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {/* Logout */}
            <button
              data-testid="admin-logout-btn"
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            >
              <LogOut className="h-5 w-5 text-stone-600" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        <div data-testid="admin-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Today's Orders"
            value={stats?.total_orders || 0}
            icon={ShoppingCart}
            color="text-blue-600 bg-blue-50"
          />
          <StatCard
            title="Revenue"
            value={`$${(stats?.total_revenue || 0).toFixed(2)}`}
            icon={DollarSign}
            color="text-green-600 bg-green-50"
          />
          <StatCard
            title="Pending"
            value={stats?.pending_orders || 0}
            icon={Clock}
            color="text-amber-600 bg-amber-50"
          />
          <StatCard
            title="Avg Order"
            value={`$${(stats?.avg_order_value || 0).toFixed(2)}`}
            icon={TrendingUp}
            color="text-[#E15A32] bg-orange-50"
          />
        </div>

        {/* Orders Feed */}
        <div className="bg-white border border-stone-200 rounded-xl">
          <div className="p-4 border-b border-stone-200">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-stone-100 rounded-lg">
                <TabsTrigger data-testid="tab-all" value="all" className="text-xs sm:text-sm rounded-md">
                  All ({orders.length})
                </TabsTrigger>
                <TabsTrigger data-testid="tab-active" value="active" className="text-xs sm:text-sm rounded-md">
                  Active ({orders.filter((o) => ["new", "accepted", "preparing", "ready"].includes(o.status)).length})
                </TabsTrigger>
                <TabsTrigger data-testid="tab-new" value="new" className="text-xs sm:text-sm rounded-md">
                  New ({orders.filter((o) => o.status === "new").length})
                </TabsTrigger>
                <TabsTrigger data-testid="tab-completed" value="completed" className="text-xs sm:text-sm rounded-md">
                  Done ({orders.filter((o) => ["completed", "rejected"].includes(o.status)).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredOrders.length === 0 ? (
              <div data-testid="no-orders-message" className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-stone-200 mx-auto mb-3" />
                <p className="text-stone-400 font-medium">No orders yet</p>
                <p className="text-stone-300 text-sm mt-1">Orders will appear here in real-time</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  formatTime={formatTime}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-stone-500 font-medium">{title}</p>
          <p className="text-lg font-bold text-stone-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Order Card ─── */
function OrderCard({ order, onStatusUpdate, formatTime }) {
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
              ? ` &middot; ${order.customer_address}`
              : ""}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-stone-900">${order.total.toFixed(2)}</p>
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
            <span className="text-stone-600 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
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
