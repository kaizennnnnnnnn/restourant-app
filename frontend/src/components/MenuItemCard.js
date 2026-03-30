import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export default function MenuItemCard({ item, onDetail, disabled }) {
  const { addItem } = useCart();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (disabled) return;
    addItem(item, [], 1, "");
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div
      data-testid={`menu-item-${item.id}`}
      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
      onClick={onDetail}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={item.image_url}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover object-center menu-item-image"
          loading="lazy"
        />
        {item.is_popular && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-[#FCD34D] text-[#78350F] border-0 text-xs font-bold flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> Popular
            </Badge>
          </div>
        )}
        {!disabled && (
          <button
            data-testid={`quick-add-${item.id}`}
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full h-10 w-10 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 active-scale sm:opacity-100"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-stone-900 text-base truncate">{item.name}</h3>
            <p className="text-stone-500 text-sm mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-stone-900">{formatPrice(item.price)}</span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {item.prep_time_minutes} min
          </span>
        </div>
      </div>
    </div>
  );
}
