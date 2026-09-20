import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../services/api.js";

const SOURCES = ["WhatsApp", "Phone", "Walk-in"];
const STATUSES = ["new", "processing", "confirmed", "delivered", "cancelled"];

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleStatusUpdate = async (id) => {
    try {
      const updated = await updateOrderStatus(id, editStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      setEditingId(null);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

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
        Failed to load orders: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Orders</h2>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Order ID</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Items</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Qty</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Price</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Source</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalQty = order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
                const itemNames = order.items?.map((i) => i.product_name).join(", ") || "—";
                return (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-700">{order.id}</td>
                    <td className="px-5 py-3 text-gray-600">{order.customer_name || "N/A"}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-[150px] truncate" title={itemNames}>{itemNames}</td>
                    <td className="px-5 py-3 text-gray-600">{totalQty}</td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{order.source}</span>
                    </td>
                    <td className="px-5 py-3">
                      {editingId === order.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1.5 py-1"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusUpdate(order.id)}
                            className="text-xs bg-ocean-600 text-white px-2 py-1 rounded hover:bg-ocean-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-gray-500 px-2 py-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {statusBadge(order.status)}
                          <button
                            onClick={() => { setEditingId(order.id); setEditStatus(order.status); }}
                            className="text-xs text-ocean-600 hover:text-ocean-800 font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;
