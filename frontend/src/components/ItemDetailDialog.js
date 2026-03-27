import { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Star } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export default function ItemDetailDialog({ item, open, onClose, disabled }) {
  const { addItem } = useCart();
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.name === addOn.name)
        ? prev.filter((a) => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  const lineTotal = (item.price + addOnTotal) * quantity;

  const handleAdd = () => {
    addItem(item, selectedAddOns, quantity, instructions);
    toast.success(`${item.name} added to cart`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative h-52 sm:h-64 overflow-hidden">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          {item.is_popular && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#FCD34D] text-[#78350F] border-0 text-xs font-bold flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" /> Popular
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          <DialogHeader className="space-y-2">
            <DialogTitle
              className="text-xl font-bold text-stone-900"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              {item.name}
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-sm leading-relaxed">
              {item.description}
            </DialogDescription>
            <p className="text-xl font-bold text-[#E15A32]">{formatPrice(item.price)}</p>
          </DialogHeader>

          {/* Add-ons */}
          {item.add_ons?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Customize Your Order</h4>
              <div className="space-y-2">
                {item.add_ons.map((addOn) => (
                  <label
                    key={addOn.name}
                    data-testid={`addon-${addOn.name.replace(/\s+/g, "-").toLowerCase()}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedAddOns.some((a) => a.name === addOn.name)}
                        onCheckedChange={() => toggleAddOn(addOn)}
                      />
                      <span className="text-sm text-stone-700">{addOn.name}</span>
                    </div>
                    <span className="text-sm font-medium text-stone-500">+{formatPrice(addOn.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="text-sm font-semibold text-stone-900 block mb-2">Special Instructions</label>
            <textarea
              data-testid="special-instructions-input"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. No onions, extra spicy..."
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#E15A32] focus:outline-none focus:ring-1 focus:ring-[#E15A32] resize-none h-20"
            />
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 bg-stone-100 rounded-full px-2 py-1">
              <button
                data-testid="detail-decrease-qty"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors"
              >
                <Minus className="h-4 w-4 text-stone-600" />
              </button>
              <span className="w-8 text-center font-semibold text-stone-900">{quantity}</span>
              <button
                data-testid="detail-increase-qty"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors"
              >
                <Plus className="h-4 w-4 text-stone-600" />
              </button>
            </div>
            <Button
              data-testid="detail-add-to-cart-btn"
              onClick={handleAdd}
              disabled={disabled}
              className="flex-1 bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full h-12 font-semibold text-base active-scale"
            >
              Add {formatPrice(lineTotal)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
