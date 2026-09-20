import { useEffect, useState } from "react";
import { BarChart3, ShoppingCart, Package, Users } from "lucide-react";
import { getOrders, getProducts, getCustomers } from "../services/api.js";

function Analytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [o, p, c] = await Promise.all([getOrders(), getProducts(), getCustomers()]);
        if (cancelled) return;
        setOrders(o);
        setProducts(p);
        setCustomers(c);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Failed to load analytics: {error}
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.stock >= 12).length;

  const statCards = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <BarChart3 size={20} />, color: "bg-ocean-100 text-ocean-600" },
    { label: "Total Orders", value: orders.length, icon: <ShoppingCart size={20} />, color: "bg-blue-100 text-blue-600" },
    { label: "Avg Order Value", value: `₹${avgOrderValue.toFixed(0)}`, icon: <Package size={20} />, color: "bg-purple-100 text-purple-600" },
    { label: "Customers", value: customers.length, icon: <Users size={20} />, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Analytics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
          <p className="text-xs text-green-600 mt-1">{inStockProducts} in stock</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fulfillment</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.length > 0 ? Math.round((orders.filter((o) => o.status === "delivered").length / orders.length) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Delivered rate</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sources</p>
          <div className="mt-2 space-y-1">
            {["WhatsApp", "Phone", "Walk-in"].map((src) => {
              const count = orders.filter((o) => o.source === src).length;
              return (
                <div key={src} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{src}</span>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
