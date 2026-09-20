import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardStats,
  getOrders,
  getAILogs,
  getProducts,
  LOW_STOCK_THRESHOLD,
} from "../services/api.js";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function StatCard({ label, value, subtext, icon, highlight }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${highlight || "text-gray-900"}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight ? "bg-ocean-100 text-ocean-600" : "bg-gray-100 text-gray-500"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, o, p, logs] = await Promise.all([
          getDashboardStats(),
          getOrders(),
          getProducts(),
          getAILogs(),
        ]);
        if (cancelled) return;
        setStats(s);
        setOrders(o);
        setProducts(p);
        setAiLogs(logs);
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
        Failed to load dashboard: {error}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-gray-500">No data available.</div>;
  }

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((p) => p.stock < LOW_STOCK_THRESHOLD);
  const recentLogs = aiLogs.slice(-5);

  const statusBadge = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-700",
      processing: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-ocean-100 text-ocean-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Today's Orders"
          value={stats.orders_today ?? 0}
          icon={<span className="text-lg">📦</span>}
        />
        <StatCard
          label="Sales"
          value={formatCurrency(stats.sales ?? 0)}
          icon={<span className="text-lg">💰</span>}
        />
        <StatCard
          label="Low Stock Items"
          value={stats.low_stock ?? 0}
          subtext={`Below ${LOW_STOCK_THRESHOLD} units`}
          icon={<span className="text-lg">⚠️</span>}
          highlight="text-orange-600"
        />
        <StatCard
          label="AI Agent Status"
          value="ACTIVE"
          subtext={stats.ai_running ? "Running" : "Idle"}
          icon={
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-ocean-500 rounded-full animate-pulse" />
            </span>
          }
          highlight="text-ocean-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/orders" className="text-xs font-medium text-ocean-600 hover:text-ocean-700">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium text-gray-500">Order ID</th>
                  <th className="text-left px-5 py-2.5 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-5 py-2.5 font-medium text-gray-500">Source</th>
                  <th className="text-left px-5 py-2.5 font-medium text-gray-500">Total</th>
                  <th className="text-left px-5 py-2.5 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">No orders yet</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-700">{order.id}</td>
                      <td className="px-5 py-3 text-gray-600">{order.customer_name || "N/A"}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{order.source}</span>
                      </td>
                      <td className="px-5 py-3 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-3">{statusBadge(order.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Low Stock */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Low Stock Alert</h3>
            </div>
            <div className="p-4 space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-400">All stock levels healthy</p>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.stock} {p.unit} left</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">Low</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Logs Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Latest AI Activity</h3>
            </div>
            <div className="p-4 space-y-3">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-gray-400">No recent activity</p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{log.action}</p>
                      <p className="text-xs text-gray-400">
                        {log.order_id && <><span className="text-ocean-600">{log.order_id}</span> {"| "}</>}
                        {new Date(log.created_at).toLocaleTimeString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
