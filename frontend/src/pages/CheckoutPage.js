import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { createOrder, fetchMenu, fetchSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Flame,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  Coffee,
  IceCream,
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, total, clearCart, addItem } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState("delivery");
  const [submitting, setSubmitting] = useState(false);
  const [upsellItems, setUpsellItems] = useState([]);

  // Fetch upsell suggestions (drinks & desserts not in cart)
  useEffect(() => {
    fetchMenu().then(({ items: menuItems }) => {
      const cartIds = new Set(items.map((i) => i.menuItemId));
      const suggestions = menuItems
        .filter((m) => (m.category === "Drinks" || m.category === "Desserts") && !cartIds.has(m.id))
        .slice(0, 3);
      setUpsellItems(suggestions);
    }).catch(() => {});
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          menu_item_id: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          add_ons: i.addOns,
          special_instructions: i.specialInstructions,
        })),
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        order_type: orderType,
        subtotal,
        total,
      };
      const order = await createOrder(orderData);
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to place order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpsellAdd = (item) => {
    addItem(item, [], 1, "");
    toast.success(`${item.name} added!`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
        <ShoppingBag className="h-20 w-20 text-stone-200 mb-4" />
        <h2
          className="text-2xl font-bold text-stone-900 mb-2"
          style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
        >
          Cart is Empty
        </h2>
        <p className="text-stone-500 mb-6">Add some delicious items first</p>
        <Link to="/">
          <Button
            data-testid="back-to-menu-btn"
            className="bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full px-6 active-scale"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full hover:bg-stone-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </Link>
          <Flame className="h-5 w-5 text-[#E15A32]" />
          <h1
            className="text-lg font-bold text-stone-900"
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
          >
            Checkout
          </h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Cart Summary */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-lg font-semibold text-stone-900" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Your Order ({items.length} item{items.length > 1 ? "s" : ""})
            </h2>

            <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  data-testid={`checkout-item-${item.cartId}`}
                  className="flex gap-3 p-4"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-stone-900 text-sm">{item.name}</h4>
                    {item.addOns.length > 0 && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        + {item.addOns.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-stone-50 rounded-full px-1 py-0.5 border border-stone-200">
                        <button
                          data-testid={`checkout-decrease-${item.cartId}`}
                          onClick={() =>
                            item.quantity <= 1
                              ? removeItem(item.cartId)
                              : updateQuantity(item.cartId, item.quantity - 1)
                          }
                          className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-stone-100"
                        >
                          {item.quantity <= 1 ? (
                            <Trash2 className="h-3 w-3 text-red-500" />
                          ) : (
                            <Minus className="h-3 w-3 text-stone-600" />
                          )}
                        </button>
                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                        <button
                          data-testid={`checkout-increase-${item.cartId}`}
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-stone-100"
                        >
                          <Plus className="h-3 w-3 text-stone-600" />
                        </button>
                      </div>
                      <span className="font-bold text-stone-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upsell */}
            {upsellItems.length > 0 && (
              <div data-testid="upsell-section">
                <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-[#E15A32]" />
                  Add something extra?
                </h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {upsellItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-36 bg-white border border-stone-200 rounded-xl overflow-hidden"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-20 object-cover"
                        loading="lazy"
                      />
                      <div className="p-2">
                        <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-stone-700">${item.price.toFixed(2)}</span>
                          <button
                            data-testid={`upsell-add-${item.id}`}
                            onClick={() => handleUpsellAdd(item)}
                            className="bg-[#E15A32] text-white rounded-full h-6 w-6 flex items-center justify-center active-scale"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-5 sticky top-24">
              <h2 className="text-lg font-semibold text-stone-900" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                Your Details
              </h2>

              {/* Order Type Toggle */}
              <div data-testid="order-type-toggle" className="flex gap-2">
                <button
                  type="button"
                  data-testid="order-type-delivery"
                  onClick={() => setOrderType("delivery")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all active-scale ${
                    orderType === "delivery"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  data-testid="order-type-pickup"
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all active-scale ${
                    orderType === "pickup"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Pickup
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1.5">Name *</label>
                  <Input
                    data-testid="checkout-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="rounded-xl h-11 border-stone-200 focus:border-[#E15A32] focus:ring-[#E15A32]"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1.5">Phone *</label>
                  <Input
                    data-testid="checkout-phone-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    type="tel"
                    className="rounded-xl h-11 border-stone-200 focus:border-[#E15A32] focus:ring-[#E15A32]"
                    required
                  />
                </div>
                {orderType === "delivery" && (
                  <div>
                    <label className="text-sm font-medium text-stone-700 block mb-1.5">Delivery Address</label>
                    <Input
                      data-testid="checkout-address-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, apt, city..."
                      className="rounded-xl h-11 border-stone-200 focus:border-[#E15A32] focus:ring-[#E15A32]"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-700 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment</span>
                  <Badge className="bg-stone-100 text-stone-600 border-stone-200 text-xs">Cash on Delivery</Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold pt-1">
                  <span className="text-stone-900">Total</span>
                  <span className="text-[#E15A32]">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                data-testid="place-order-btn"
                disabled={submitting}
                className="w-full bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full h-12 text-base font-semibold active-scale"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Placing Order...
                  </>
                ) : (
                  `Place Order - $${total.toFixed(2)}`
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
