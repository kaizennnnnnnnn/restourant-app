// ─── Mock API — no backend required ──────────────────────────────────
// All data is static. Used for client demos and previews.

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ─── Static Data ─────────────────────────────────────────────────────

const SETTINGS = {
  restaurant_name: "Bella Cucina",
  is_open: true,
  default_prep_time: 20,
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Downtown",
  tagline: "Authentic flavors, crafted with love",
};

const MENU_ITEMS = [
  // Pizza
  { id: "1", name: "Margherita Classic", description: "Fresh mozzarella, San Marzano tomatoes, basil on a crispy thin crust", price: 14.99, category: "Pizza", image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", add_ons: [{ name: "Extra Cheese", price: 2.00 }, { name: "Mushrooms", price: 1.50 }, { name: "Jalapenos", price: 1.00 }], is_popular: true, prep_time_minutes: 18 },
  { id: "2", name: "Pepperoni Supreme", description: "Double pepperoni, mozzarella blend, and our signature tomato sauce", price: 16.99, category: "Pizza", image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", add_ons: [{ name: "Extra Cheese", price: 2.00 }, { name: "Hot Honey", price: 1.50 }, { name: "Extra Pepperoni", price: 2.50 }], is_popular: true, prep_time_minutes: 20 },
  { id: "3", name: "BBQ Chicken", description: "Grilled chicken, red onions, BBQ sauce, cilantro, smoked gouda", price: 17.99, category: "Pizza", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", add_ons: [{ name: "Extra Chicken", price: 3.00 }, { name: "Pineapple", price: 1.50 }], is_popular: false, prep_time_minutes: 22 },
  { id: "4", name: "Truffle Mushroom", description: "Wild mushroom medley, truffle oil, fontina cheese, fresh thyme", price: 19.99, category: "Pizza", image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", add_ons: [{ name: "Extra Truffle Oil", price: 2.50 }, { name: "Arugula", price: 1.00 }], is_popular: false, prep_time_minutes: 20 },
  // Burgers
  { id: "5", name: "Classic Smash Burger", description: "Double smashed patty, American cheese, pickles, special sauce", price: 13.99, category: "Burgers", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", add_ons: [{ name: "Bacon", price: 2.00 }, { name: "Extra Patty", price: 4.00 }, { name: "Fried Egg", price: 1.50 }], is_popular: true, prep_time_minutes: 15 },
  { id: "6", name: "Spicy Jalapeno Burger", description: "Angus beef, pepper jack, crispy jalapenos, chipotle mayo", price: 15.99, category: "Burgers", image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80", add_ons: [{ name: "Bacon", price: 2.00 }, { name: "Avocado", price: 2.50 }], is_popular: false, prep_time_minutes: 15 },
  { id: "7", name: "Mushroom Swiss Burger", description: "Sauteed mushrooms, Swiss cheese, garlic aioli, brioche bun", price: 14.99, category: "Burgers", image_url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80", add_ons: [{ name: "Extra Mushrooms", price: 1.50 }, { name: "Truffle Mayo", price: 1.50 }], is_popular: false, prep_time_minutes: 15 },
  // Sides
  { id: "8", name: "Loaded Fries", description: "Crispy fries with cheese sauce, bacon bits, and green onions", price: 8.99, category: "Sides", image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80", add_ons: [{ name: "Extra Cheese Sauce", price: 1.50 }, { name: "Sour Cream", price: 0.75 }], is_popular: true, prep_time_minutes: 10 },
  { id: "9", name: "Caesar Salad", description: "Romaine, parmesan, croutons, house-made Caesar dressing", price: 9.99, category: "Sides", image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80", add_ons: [{ name: "Grilled Chicken", price: 3.00 }], is_popular: false, prep_time_minutes: 8 },
  { id: "10", name: "Garlic Bread", description: "Freshly baked with garlic butter, herbs, and melted mozzarella", price: 6.99, category: "Sides", image_url: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&q=80", add_ons: [{ name: "Extra Cheese", price: 1.50 }], is_popular: false, prep_time_minutes: 8 },
  // Drinks
  { id: "11", name: "Fresh Lemonade", description: "House-squeezed with a hint of mint and raw honey", price: 4.99, category: "Drinks", image_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80", add_ons: [{ name: "Ginger Shot", price: 0.75 }], is_popular: false, prep_time_minutes: 3 },
  { id: "12", name: "Iced Coffee", description: "Cold brewed for 24 hours, served over ice with cream", price: 5.49, category: "Drinks", image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", add_ons: [{ name: "Extra Shot", price: 1.00 }, { name: "Vanilla Syrup", price: 0.50 }], is_popular: true, prep_time_minutes: 3 },
  { id: "13", name: "Mango Smoothie", description: "Fresh mango, yogurt, and a touch of honey blended smooth", price: 6.99, category: "Drinks", image_url: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80", add_ons: [{ name: "Protein Boost", price: 1.50 }], is_popular: false, prep_time_minutes: 5 },
  // Desserts
  { id: "14", name: "Tiramisu", description: "Classic Italian espresso-soaked ladyfingers and mascarpone cream", price: 8.99, category: "Desserts", image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", add_ons: [{ name: "Extra Cocoa", price: 0.50 }], is_popular: true, prep_time_minutes: 5 },
  { id: "15", name: "Chocolate Lava Cake", description: "Warm dark chocolate center served with vanilla gelato", price: 9.99, category: "Desserts", image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80", add_ons: [{ name: "Extra Gelato", price: 2.00 }], is_popular: false, prep_time_minutes: 12 },
  { id: "16", name: "New York Cheesecake", description: "Creamy cheesecake with graham crust and mixed berry compote", price: 7.99, category: "Desserts", image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80", add_ons: [{ name: "Berry Compote", price: 1.00 }, { name: "Whipped Cream", price: 0.75 }], is_popular: false, prep_time_minutes: 5 },
];

const DEMO_ORDERS = [
  { id: "demo-1", order_number: 1042, customer_name: "Marko Petrović", customer_phone: "+381 64 123 4567", customer_address: "Knez Mihailova 12, Beograd", order_type: "delivery", status: "preparing", total: 47.97, subtotal: 47.97, created_at: new Date(Date.now() - 12 * 60000).toISOString(), estimated_prep_time: 20, items: [{ name: "Margherita Classic", quantity: 2, price: 14.99, add_ons: [{ name: "Extra Cheese" }] }, { name: "Fresh Lemonade", quantity: 1, price: 4.99, add_ons: [] }] },
  { id: "demo-2", order_number: 1041, customer_name: "Ana Jovanović", customer_phone: "+381 63 987 6543", customer_address: "", order_type: "pickup", status: "ready", total: 29.97, subtotal: 29.97, created_at: new Date(Date.now() - 30 * 60000).toISOString(), estimated_prep_time: 15, items: [{ name: "Classic Smash Burger", quantity: 1, price: 13.99, add_ons: [{ name: "Bacon" }] }, { name: "Loaded Fries", quantity: 1, price: 8.99, add_ons: [] }, { name: "Iced Coffee", quantity: 1, price: 5.49, add_ons: [] }] },
  { id: "demo-3", order_number: 1040, customer_name: "Stefan Nikolić", customer_phone: "+381 65 555 0000", customer_address: "Terazije 5, Beograd", order_type: "delivery", status: "completed", total: 54.96, subtotal: 54.96, created_at: new Date(Date.now() - 90 * 60000).toISOString(), estimated_prep_time: 25, items: [{ name: "Pepperoni Supreme", quantity: 2, price: 16.99, add_ons: [] }, { name: "Tiramisu", quantity: 2, price: 8.99, add_ons: [] }] },
];

// In-memory order store for the demo session
let sessionOrders = [...DEMO_ORDERS];
let orderCounter = 1043;
let sessionSettings = { ...SETTINGS };

// ─── Public ──────────────────────────────────────────────────────────

export const fetchMenu = async () => {
  await delay();
  const categories = [...new Set(MENU_ITEMS.map((i) => i.category))].sort();
  return { items: MENU_ITEMS, categories };
};

export const fetchSettings = async () => {
  await delay(200);
  return { ...sessionSettings };
};

export const createOrder = async (data) => {
  await delay(600);
  const order = {
    ...data,
    id: `order-${Date.now()}`,
    order_number: orderCounter++,
    status: "new",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_prep_time: sessionSettings.default_prep_time,
  };
  sessionOrders.unshift(order);
  return order;
};

export const fetchOrder = async (id) => {
  await delay(200);
  const order = sessionOrders.find((o) => o.id === id);
  if (!order) throw Object.assign(new Error("Not found"), { response: { status: 404 } });
  return { ...order };
};

// ─── Admin ──────────────────────────────────────────────────────────

export const adminLogin = async ({ username, password }) => {
  await delay(500);
  if (username === "admin" && password === "admin123") {
    return { token: "demo-token", username: "admin" };
  }
  throw Object.assign(new Error("Invalid credentials"), { response: { status: 401, data: { detail: "Invalid credentials" } } });
};

export const fetchAdminOrders = async () => {
  await delay(300);
  return { orders: [...sessionOrders] };
};

export const updateOrderStatus = async (orderId, { status }) => {
  await delay(300);
  sessionOrders = sessionOrders.map((o) =>
    o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
  );
  return sessionOrders.find((o) => o.id === orderId);
};

export const fetchAdminStats = async () => {
  await delay(200);
  const today = sessionOrders.filter((o) => o.status !== "rejected");
  const revenue = today.reduce((s, o) => s + o.total, 0);
  const pending = today.filter((o) => ["new", "accepted", "preparing"].includes(o.status)).length;
  return {
    total_orders: today.length,
    total_revenue: revenue,
    avg_order_value: today.length ? revenue / today.length : 0,
    pending_orders: pending,
  };
};

export const updateSettings = async (data) => {
  await delay(300);
  sessionSettings = { ...sessionSettings, ...data };
  return { ...sessionSettings };
};
