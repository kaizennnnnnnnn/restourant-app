import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { fetchMenu, fetchSettings } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import CartSheet from "@/components/CartSheet";
import MenuItemCard from "@/components/MenuItemCard";
import ItemDetailDialog from "@/components/ItemDetailDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  ChevronDown,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

const HERO_IMAGE =
  "https://static.prod-images.emergentagent.com/jobs/2095418a-30a2-45f4-990c-e422fc73b1d8/images/7ddfcdd67a00bfe5ceb128bb166c3d1b88a1f087b1b4857023a4a77512116f96.png";

export default function LandingPage() {
  const [menuData, setMenuData] = useState({ items: [], categories: [] });
  const [settings, setSettings] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  const { itemCount, total } = useCart();

  useEffect(() => {
    Promise.all([fetchMenu(), fetchSettings()])
      .then(([menu, sett]) => {
        setMenuData(menu);
        setSettings(sett);
      })
      .catch(() => toast.error("Failed to load menu"))
      .finally(() => setLoading(false));
  }, []);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredItems =
    activeCategory === "All"
      ? menuData.items
      : menuData.items.filter((i) => i.category === activeCategory);

  const isOpen = settings?.is_open !== false;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ─── Navbar ─── */}
      <nav
        data-testid="main-navbar"
        className="bg-white/80 backdrop-blur-xl border-b border-stone-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-[#E15A32]" />
            <span
              className="text-xl font-bold text-stone-900"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              {settings?.restaurant_name || "Bella Cucina"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isOpen && (
              <Badge data-testid="closed-badge" className="bg-red-100 text-red-700 border-red-200 text-xs">
                Closed
              </Badge>
            )}
            <button
              data-testid="nav-cart-btn"
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
            >
              <ShoppingBag className="h-6 w-6 text-stone-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E15A32] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-cart-bounce">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section data-testid="hero-section" className="relative h-[70vh] min-h-[480px] max-h-[640px] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Restaurant interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-gradient absolute inset-0" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <div className="animate-fade-in-up">
            <p className="text-[#FCD34D] text-xs tracking-[0.2em] uppercase font-bold mb-4">
              {settings?.tagline || "Authentic flavors, crafted with love"}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 leading-tight"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              {settings?.restaurant_name || "Bella Cucina"}
            </h1>
            <p className="text-stone-300 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
              Fresh ingredients, bold flavors, delivered to your door
            </p>
            <Button
              data-testid="hero-order-now-btn"
              onClick={scrollToMenu}
              disabled={!isOpen}
              className="bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full px-8 py-3 h-auto text-base font-semibold active-scale animate-pulse-glow"
            >
              {isOpen ? "Order Now" : "Currently Closed"}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {/* Info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-6 text-sm text-stone-300 flex-wrap">
              {settings?.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {settings.address}
                </span>
              )}
              {settings?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {settings.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> ~{settings?.default_prep_time || 20} min
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Menu Section ─── */}
      <section ref={menuRef} data-testid="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center mb-8">
          <h2
            className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
          >
            Our Menu
          </h2>
          <p className="text-stone-500 mt-2 text-sm sm:text-base">
            Handcrafted dishes made fresh daily
          </p>
        </div>

        {/* Category Pills */}
        <div data-testid="category-filters" className="category-scroll flex gap-2 mb-8 pb-2 justify-start sm:justify-center">
          <button
            data-testid="category-all"
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all active-scale ${
              activeCategory === "All"
                ? "bg-stone-900 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            All
          </button>
          {menuData.categories.map((cat) => (
            <button
              key={cat}
              data-testid={`category-${cat.toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all active-scale ${
                activeCategory === cat
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-stone-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-full" />
                  <div className="h-4 bg-stone-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onDetail={() => setDetailItem(item)}
                disabled={!isOpen}
              />
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <p className="text-center text-stone-400 py-12">No items in this category</p>
        )}
      </section>

      {/* ─── Floating Cart Button (Mobile) ─── */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-safe sm:hidden">
          <button
            data-testid="floating-cart-btn"
            onClick={() => setCartOpen(true)}
            className="w-full bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full h-14 flex items-center justify-between px-6 shadow-lg active-scale"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="font-semibold">{itemCount} item{itemCount > 1 ? "s" : ""}</span>
            </span>
            <span className="font-bold text-lg">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {/* ─── Cart Sheet ─── */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      {/* ─── Item Detail Dialog ─── */}
      {detailItem && (
        <ItemDetailDialog
          item={detailItem}
          open={!!detailItem}
          onClose={() => setDetailItem(null)}
          disabled={!isOpen}
        />
      )}

      {/* ─── Footer ─── */}
      <footer className="border-t border-stone-200 bg-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-stone-400 text-sm">
            {settings?.restaurant_name || "Bella Cucina"} &middot; {settings?.address || ""} &middot;{" "}
            {settings?.phone || ""}
          </p>
          <p className="text-stone-300 text-xs mt-2">Powered by OrderFlow</p>
        </div>
      </footer>
    </div>
  );
}
