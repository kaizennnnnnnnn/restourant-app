import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartSheet({ open, onOpenChange }) {
  const { items, removeItem, updateQuantity, subtotal, total, itemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md bg-white p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-xl font-bold text-stone-900 flex items-center gap-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            <ShoppingBag className="h-5 w-5 text-[#E15A32]" />
            Your Order
            {itemCount > 0 && (
              <span data-testid="cart-item-count-badge" className="ml-2 bg-[#E15A32] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="text-stone-500 text-sm">
            {itemCount === 0 ? "Your cart is empty" : `${itemCount} item${itemCount > 1 ? "s" : ""} in your cart`}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div data-testid="empty-cart-message" className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="h-16 w-16 text-stone-200 mb-4" />
              <p className="text-stone-400 text-lg font-medium mb-1">Nothing here yet</p>
              <p className="text-stone-400 text-sm">Add some delicious items from the menu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  data-testid={`cart-item-${item.cartId}`}
                  className="flex gap-3 bg-stone-50 rounded-xl p-3"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-stone-900 text-sm truncate">{item.name}</h4>
                    {item.addOns.length > 0 && (
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        + {item.addOns.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-xs text-stone-400 italic truncate mt-0.5">
                        "{item.specialInstructions}"
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white rounded-full px-1 py-0.5 border border-stone-200">
                        <button
                          data-testid={`cart-decrease-${item.cartId}`}
                          onClick={() => item.quantity <= 1 ? removeItem(item.cartId) : updateQuantity(item.cartId, item.quantity - 1)}
                          className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                        >
                          {item.quantity <= 1 ? <Trash2 className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-stone-600" />}
                        </button>
                        <span className="text-sm font-medium text-stone-900 w-5 text-center">{item.quantity}</span>
                        <button
                          data-testid={`cart-increase-${item.cartId}`}
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                        >
                          <Plus className="h-3 w-3 text-stone-600" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-stone-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-4 bg-white space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-medium text-stone-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span className="text-stone-900">Total</span>
              <span className="text-[#E15A32]">${total.toFixed(2)}</span>
            </div>
            <Button
              data-testid="cart-checkout-btn"
              onClick={handleCheckout}
              className="w-full bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full h-12 text-base font-semibold active-scale flex items-center justify-center gap-2"
            >
              Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
