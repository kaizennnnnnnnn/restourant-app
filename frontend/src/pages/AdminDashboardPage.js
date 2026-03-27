import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminOrders,
  fetchAdminStats,
  updateOrderStatus,
  updateSettings,
  fetchSettings,
} from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/admin/StatCard";
import OrderCard from "@/components/admin/OrderCard";
import MenuManagement from "@/components/admin/MenuManagement";
import {
  Flame,
  LogOut,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  Volume2,
  VolumeX,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

// Simple beep using Web Audio API
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
  } catch {
    // Ignore audio errors
  }
}

const ACTIVE_STATUSES = ["new", "accepted", "preparing", "ready"];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettingsState] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState("orders");
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

      if (soundEnabled && prevOrderCount.current > 0 && newOrders.length > prevOrderCount.current) {
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
      ? orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
      : orders.filter((o) => o.status === activeTab);

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
        {/* Section Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSection === "orders"
                ? "bg-stone-900 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Orders
          </button>
          <button
            onClick={() => setActiveSection("menu")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSection === "menu"
                ? "bg-stone-900 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" /> Menu
          </button>
        </div>

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
            value={formatPrice(stats?.total_revenue || 0)}
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
            value={formatPrice(stats?.avg_order_value || 0)}
            icon={TrendingUp}
            color="text-[#E15A32] bg-orange-50"
          />
        </div>

        {/* Menu Management */}
        {activeSection === "menu" && (
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <MenuManagement />
          </div>
        )}

        {/* Orders Feed */}
        {activeSection === "orders" && <div className="bg-white border border-stone-200 rounded-xl">
          <div className="p-4 border-b border-stone-200">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-stone-100 rounded-lg">
                <TabsTrigger data-testid="tab-all" value="all" className="text-xs sm:text-sm rounded-md">
                  All ({orders.length})
                </TabsTrigger>
                <TabsTrigger data-testid="tab-active" value="active" className="text-xs sm:text-sm rounded-md">
                  Active ({orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length})
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
                />
              ))
            )}
          </div>
        </div>}
      </div>
    </div>
  );
}
