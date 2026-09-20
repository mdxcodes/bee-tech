const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

/* ───────── MOCK FALLBACK ───────── */

const MOCK_PRODUCTS = [
  { id: "P001", name: "Maggi", aliases: ["maggi", "noodles"], category: "Snacks", price: 15, unit: "packet", stock: 20 },
  { id: "P002", name: "Amul Milk", aliases: ["milk", "doodh"], category: "Dairy", price: 30, unit: "litre", stock: 10 },
  { id: "P003", name: "Aashirvaad Atta", aliases: ["atta", "flour"], category: "Grocery", price: 55, unit: "kg", stock: 15 },
  { id: "P004", name: "Rice", aliases: ["rice", "chawal"], category: "Grocery", price: 60, unit: "kg", stock: 25 },
  { id: "P005", name: "Fortune Oil", aliases: ["oil", "tel"], category: "Grocery", price: 130, unit: "litre", stock: 12 },
  { id: "P006", name: "Bread", aliases: ["bread"], category: "Bakery", price: 40, unit: "packet", stock: 10 },
  { id: "P007", name: "Lays", aliases: ["lays", "chips"], category: "Snacks", price: 20, unit: "packet", stock: 25 },
];

const MOCK_CUSTOMERS = [
  { id: "C001", name: "Rajesh Kumar", phone: "9876543210" },
  { id: "C002", name: "Priya Sharma", phone: "9876543211" },
  { id: "C003", name: "Amit Patel", phone: "9876543212" },
  { id: "C004", name: "Sunita Devi", phone: "9876543213" },
  { id: "C005", name: "Vikram Singh", phone: "9876543214" },
];

const MOCK_ORDERS = [
  {
    id: "ORD-1001",
    customer_id: "C001",
    customer_name: "Rajesh Kumar",
    source: "WhatsApp",
    status: "delivered",
    total: 145,
    created_at: "2026-09-20T08:30:00Z",
    items: [
      { product_id: "P001", product_name: "Maggi", quantity: 3, unit_price: 15, item_total: 45 },
      { product_id: "P005", product_name: "Fortune Oil", quantity: 1, unit_price: 100, item_total: 100 },
    ],
  },
  {
    id: "ORD-1002",
    customer_id: "C002",
    customer_name: "Priya Sharma",
    source: "Phone",
    status: "confirmed",
    total: 95,
    created_at: "2026-09-20T10:15:00Z",
    items: [
      { product_id: "P003", product_name: "Aashirvaad Atta", quantity: 1, unit_price: 55, item_total: 55 },
      { product_id: "P006", product_name: "Bread", quantity: 1, unit_price: 40, item_total: 40 },
    ],
  },
  {
    id: "ORD-1003",
    customer_id: "C003",
    customer_name: "Amit Patel",
    source: "Walk-in",
    status: "processing",
    total: 210,
    created_at: "2026-09-20T11:45:00Z",
    items: [
      { product_id: "P004", product_name: "Rice", quantity: 2, unit_price: 60, item_total: 120 },
      { product_id: "P005", product_name: "Fortune Oil", quantity: 1, unit_price: 90, item_total: 90 },
    ],
  },
  {
    id: "ORD-1004",
    customer_id: "C001",
    customer_name: "Rajesh Kumar",
    source: "WhatsApp",
    status: "new",
    total: 50,
    created_at: "2026-09-20T12:00:00Z",
    items: [
      { product_id: "P002", product_name: "Amul Milk", quantity: 1, unit_price: 30, item_total: 30 },
      { product_id: "P007", product_name: "Lays", quantity: 1, unit_price: 20, item_total: 20 },
    ],
  },
  {
    id: "ORD-1005",
    customer_id: "C004",
    customer_name: "Sunita Devi",
    source: "Phone",
    status: "cancelled",
    total: 75,
    created_at: "2026-09-20T09:00:00Z",
    items: [
      { product_id: "P004", product_name: "Rice", quantity: 1, unit_price: 60, item_total: 60 },
      { product_id: "P006", product_name: "Bread", quantity: 1, unit_price: 40, item_total: 40 },
    ],
  },
];

const MOCK_AI_LOGS = [
  { id: "LOG-1", order_id: "ORD-1001", action: "Received WhatsApp order", status: "success", created_at: "2026-09-20T08:30:01Z" },
  { id: "LOG-2", order_id: "ORD-1001", action: "Understood customer request", status: "success", created_at: "2026-09-20T08:30:03Z" },
  { id: "LOG-3", order_id: "ORD-1001", action: "Identified products", status: "success", created_at: "2026-09-20T08:30:05Z" },
  { id: "LOG-4", order_id: "ORD-1001", action: "Checked Supabase inventory", status: "success", created_at: "2026-09-20T08:30:07Z" },
  { id: "LOG-5", order_id: "ORD-1001", action: "Calculated order total", status: "success", created_at: "2026-09-20T08:30:08Z" },
  { id: "LOG-6", order_id: "ORD-1001", action: "Created order", status: "success", created_at: "2026-09-20T08:30:09Z" },
  { id: "LOG-7", order_id: "ORD-1001", action: "Updated inventory", status: "success", created_at: "2026-09-20T08:30:10Z" },
  { id: "LOG-8", order_id: "ORD-1001", action: "Updated order status", status: "success", created_at: "2026-09-20T08:30:11Z" },
  { id: "LOG-9", order_id: "ORD-1001", action: "Sent confirmation to customer", status: "success", created_at: "2026-09-20T08:30:12Z" },
  { id: "LOG-10", order_id: "ORD-1002", action: "Received Phone order", status: "success", created_at: "2026-09-20T10:15:01Z" },
  { id: "LOG-11", order_id: "ORD-1002", action: "Understood customer request", status: "success", created_at: "2026-09-20T10:15:03Z" },
  { id: "LOG-12", order_id: "ORD-1002", action: "Identified products", status: "success", created_at: "2026-09-20T10:15:05Z" },
  { id: "LOG-13", order_id: "ORD-1002", action: "Checked Supabase inventory", status: "success", created_at: "2026-09-20T10:15:07Z" },
  { id: "LOG-14", order_id: "ORD-1002", action: "Calculated order total", status: "success", created_at: "2026-09-20T10:15:08Z" },
  { id: "LOG-15", order_id: "ORD-1002", action: "Created order", status: "success", created_at: "2026-09-20T10:15:09Z" },
  { id: "LOG-16", order_id: "ORD-1002", action: "Updated inventory", status: "success", created_at: "2026-09-20T10:15:10Z" },
  { id: "LOG-17", order_id: "ORD-1002", action: "Updated order status", status: "success", created_at: "2026-09-20T10:15:11Z" },
  { id: "LOG-18", order_id: "ORD-1002", action: "Sent confirmation to customer", status: "success", created_at: "2026-09-20T10:15:12Z" },
];

const MOCK_STATS = {
  orders_today: MOCK_ORDERS.filter((o) => o.status !== "cancelled").length,
  sales: MOCK_ORDERS.reduce((s, o) => s + (o.status !== "cancelled" ? o.total : 0), 0),
  low_stock: MOCK_PRODUCTS.filter((p) => p.stock < 12).length,
  ai_active: true,
  ai_running: true,
};

const LOW_STOCK_THRESHOLD = 12;

function findProduct(message) {
  const lower = message.toLowerCase();
  for (const product of MOCK_PRODUCTS) {
    const searchTerms = [product.name.toLowerCase(), ...product.aliases.map((a) => a.toLowerCase())];
    for (const term of searchTerms) {
      if (lower.includes(term)) return product;
    }
  }
  return null;
}

function mockChatResponse(message, customerId) {
  const lower = message.toLowerCase();

  if (lower.includes("cancel")) {
    const orderMatch = message.match(/ORD-\d+/i);
    if (orderMatch) {
      const orderId = orderMatch[0].toUpperCase();
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (!order) return { success: false, message: `Order ${orderId} not found.` };
      if (order.status === "delivered")
        return { success: false, message: `Sorry, order ${orderId} cannot be cancelled because it has already been delivered.` };
      if (order.status === "cancelled")
        return { success: false, message: `Order ${orderId} is already cancelled.` };
      order.status = "cancelled";
      return { success: true, message: `Your order #${orderId} has been cancelled successfully.`, order_id: orderId };
    }
    return { success: false, message: "Please provide your order ID to cancel." };
  }

  if (lower.includes("price") || lower.includes("kitne ka") || lower.includes("rate") || lower.includes("cost")) {
    const matchedProducts = MOCK_PRODUCTS.filter((p) => {
      const terms = [p.name.toLowerCase(), ...p.aliases.map((a) => a.toLowerCase())];
      return terms.some((t) => lower.includes(t));
    });
    if (matchedProducts.length === 0)
      return { success: false, message: "I couldn't find that product. Could you please specify which product?" };
    const items = matchedProducts.map((p) => ({ product_id: p.id, product_name: p.name, quantity: 1, unit: p.unit, unit_price: p.price }));
    return { success: true, message: "Here is the price information:", items, total: items.reduce((s, i) => s + i.unit_price, 0) };
  }

  if (lower.includes("available") || lower.includes("stock") || lower.match(/hai\??$/)) {
    const matchedProducts = MOCK_PRODUCTS.filter((p) => {
      const terms = [p.name.toLowerCase(), ...p.aliases.map((a) => a.toLowerCase())];
      return terms.some((t) => lower.includes(t));
    });
    if (matchedProducts.length === 0)
      return { success: false, message: "I couldn't find that product. Could you please specify which product?" };
    const items = matchedProducts.map((p) => ({ product_id: p.id, product_name: p.name, available_quantity: p.stock, unit: p.unit }));
    return { success: true, message: "Here is the availability:", items };
  }

  const items = [];
  let total = 0;
  for (const product of MOCK_PRODUCTS) {
    const quantityMatch = message.match(new RegExp(`(\\d+)\\s*(kg|litre|packet|piece|pcs)?\\s*${product.name}`, "i"));
    if (!quantityMatch) {
      const altMatch = message.match(new RegExp(`${product.name}\\s*(\\d+)`, "i"));
      if (!altMatch) continue;
    }
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
    if (product.stock < quantity)
      return {
        success: false,
        available: false,
        product: product.name,
        requested: quantity,
        available_quantity: product.stock,
        message: `Sorry! Only ${product.stock} ${product.unit}(s) of ${product.name} is available. You requested ${quantity} ${product.unit}(s).`,
      };
    items.push({ product_id: product.id, product_name: product.name, quantity, unit: product.unit, unit_price: product.price });
    total += product.price * quantity;
  }
  if (items.length === 0)
    return { success: false, message: "I couldn't understand your order. Please specify products and quantities, e.g. '2 kg rice and 1 litre oil'." };

  const orderId = `ORD-${1006 + MOCK_ORDERS.length}`;
  MOCK_ORDERS.push({ id: orderId, customer_id: customerId, customer_name: "Guest Customer", source: "Chat", status: "confirmed", total, created_at: new Date().toISOString(), items });
  return { success: true, message: `Your order has been confirmed! 🎉`, order_id, items, total };
}

/* ───────── API FUNCTIONS ───────── */

export async function getDashboardStats() {
  try {
    return await request("/dashboard/stats");
  } catch {
    return { ...MOCK_STATS };
  }
}

export async function getOrders() {
  try {
    return await request("/orders");
  } catch {
    return [...MOCK_ORDERS];
  }
}

export async function getOrder(id) {
  try {
    return await request(`/orders/${id}`);
  } catch {
    const order = MOCK_ORDERS.find((o) => o.id === id);
    return order ? { ...order } : null;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    return await request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  } catch {
    const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("Order not found");
    MOCK_ORDERS[idx] = { ...MOCK_ORDERS[idx], status };
    return { ...MOCK_ORDERS[idx] };
  }
}

export async function getProducts() {
  try {
    return await request("/products");
  } catch {
    return [...MOCK_PRODUCTS];
  }
}

export async function createProduct(data) {
  try {
    return await request("/products", { method: "POST", body: JSON.stringify(data) });
  } catch {
    const newProduct = { id: `P${String(MOCK_PRODUCTS.length + 1).padStart(3, "0")}`, ...data };
    MOCK_PRODUCTS.push(newProduct);
    return { ...newProduct };
  }
}

export async function updateProduct(id, data) {
  try {
    return await request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  } catch {
    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...data };
    return { ...MOCK_PRODUCTS[idx] };
  }
}

export async function deleteProduct(id) {
  try {
    return await request(`/products/${id}`, { method: "DELETE" });
  } catch {
    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    MOCK_PRODUCTS.splice(idx, 1);
    return { success: true };
  }
}

export async function updateProductStock(id, stock) {
  try {
    return await request(`/products/${id}/stock`, { method: "PATCH", body: JSON.stringify({ stock }) });
  } catch {
    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], stock };
    return { ...MOCK_PRODUCTS[idx] };
  }
}

export async function getCustomers() {
  try {
    return await request("/customers");
  } catch {
    return [...MOCK_CUSTOMERS];
  }
}

export async function getAILogs() {
  try {
    return await request("/ai-logs");
  } catch {
    return [...MOCK_AI_LOGS];
  }
}

export async function sendChatMessage(message, customerId, language = "en") {
  try {
    return await request("/process", {
      method: "POST",
      body: JSON.stringify({ channel: "chat", text: message, customer_identifier: customerId }),
    });
  } catch {
    return mockChatResponse(message, customerId);
  }
}

export async function cancelOrder(id) {
  try {
    return await request(`/orders/${id}/cancel`, { method: "POST" });
  } catch {
    const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
    if (idx === -1) return { success: false, message: "Order not found." };
    if (MOCK_ORDERS[idx].status === "delivered")
      return { success: false, message: `Sorry, order ${id} cannot be cancelled because it has already been delivered.` };
    if (MOCK_ORDERS[idx].status === "cancelled")
      return { success: false, message: `Order ${id} is already cancelled.` };
    MOCK_ORDERS[idx] = { ...MOCK_ORDERS[idx], status: "cancelled" };
    return { success: true, message: `Your order #${id} has been cancelled successfully.` };
  }
}

export { LOW_STOCK_THRESHOLD };
