import { useState, useEffect } from "react";
import { fetchAdminMenu, addMenuItem, toggleMenuItemAvailable, deleteMenuItem } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Star, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Pizza", "Burgers", "Sides", "Drinks", "Desserts"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Pizza",
  image_url: "",
  prep_time_minutes: "15",
  is_popular: false,
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const load = async () => {
    const { items: data } = await fetchAdminMenu();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id, available) => {
    await toggleMenuItemAvailable(id, available);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, available } : i));
    toast.success(available ? "Item enabled" : "Item hidden from menu");
  };

  const handleDelete = async (id, name) => {
    await deleteMenuItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(`${name} removed`);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      const item = await addMenuItem({
        ...form,
        price: parseFloat(form.price),
        prep_time_minutes: parseInt(form.prep_time_minutes) || 15,
      });
      setItems((prev) => [item, ...prev]);
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      toast.success(`${item.name} added to menu`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = activeCategory === "All"
    ? items
    : items.filter((i) => i.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#E15A32]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-stone-900" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Menu Items
          </h2>
          <p className="text-sm text-stone-400">{items.length} items total</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full px-4 h-9 text-sm font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-all ${
              activeCategory === cat
                ? "bg-stone-900 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-xl overflow-hidden transition-opacity ${
              item.available ? "border-stone-200 opacity-100" : "border-stone-100 opacity-50"
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
                  No image
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-stone-900 text-sm leading-tight">{item.name}</h4>
                {item.is_popular && (
                  <Star className="h-3.5 w-3.5 text-[#FCD34D] fill-current flex-shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-xs text-stone-400 line-clamp-2 mb-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">{formatPrice(item.price)}</span>
                  <span className="text-xs text-stone-400 flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />{item.prep_time_minutes}m
                  </span>
                </div>
                <Badge className="bg-stone-100 text-stone-500 border-0 text-xs">{item.category}</Badge>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.available !== false}
                    onCheckedChange={(v) => handleToggle(item.id, v)}
                    className="data-[state=checked]:bg-green-500 scale-75 origin-left"
                  />
                  <span className="text-xs text-stone-500">
                    {item.available !== false ? "Visible" : "Hidden"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-stone-400">No items in this category</div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Add Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Quattro Formaggi"
                className="rounded-xl h-10 text-sm border-stone-200"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description..."
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#E15A32] focus:outline-none focus:ring-1 focus:ring-[#E15A32] resize-none h-16"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Price ($) *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="12.99"
                  className="rounded-xl h-10 text-sm border-stone-200"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Prep time (min)</label>
                <Input
                  type="number"
                  min="1"
                  value={form.prep_time_minutes}
                  onChange={(e) => setForm({ ...form, prep_time_minutes: e.target.value })}
                  className="rounded-xl h-10 text-sm border-stone-200"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3 h-10 text-sm text-stone-900 focus:border-[#E15A32] focus:outline-none focus:ring-1 focus:ring-[#E15A32] bg-white"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">Image URL</label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="rounded-xl h-10 text-sm border-stone-200"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.is_popular}
                onCheckedChange={(v) => setForm({ ...form, is_popular: v })}
                className="data-[state=checked]:bg-[#FCD34D]"
              />
              <span className="text-sm text-stone-600 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-[#FCD34D] fill-current" /> Mark as Popular
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 rounded-full border-stone-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
